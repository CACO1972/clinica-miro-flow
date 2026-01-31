// supabase/functions/webhook-mercadopago/index.ts
// Webhook para recibir notificaciones IPN de Mercado Pago
// Deploy: supabase functions deploy webhook-mercadopago

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Mercado Pago envía notificaciones como query params o body
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Puede venir vacío
    }

    const paymentId = id || body?.data?.id
    const notificationType = topic || body?.type

    console.log('Webhook recibido:', { notificationType, paymentId, body })

    // Solo procesamos notificaciones de pago
    if (notificationType !== 'payment' && notificationType !== 'merchant_order') {
      return new Response(
        JSON.stringify({ received: true, processed: false, reason: 'Not a payment notification' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'No payment ID provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    
    if (!mpAccessToken) {
      return new Response(
        JSON.stringify({ error: 'Mercado Pago no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Consultar detalles del pago en Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    })

    if (!paymentResponse.ok) {
      console.error('Error consultando pago:', await paymentResponse.text())
      return new Response(
        JSON.stringify({ error: 'Error consultando pago' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payment = await paymentResponse.json()
    
    console.log('Pago obtenido:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference
    })

    const evaluacionId = payment.external_reference
    const paymentStatus = payment.status // approved, pending, rejected, cancelled, etc.

    if (!evaluacionId) {
      return new Response(
        JSON.stringify({ error: 'No external_reference (evaluacion_id) found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mapear status de Mercado Pago a nuestro status
    let newStatus: string
    switch (paymentStatus) {
      case 'approved':
        newStatus = 'paid'
        break
      case 'pending':
      case 'in_process':
        newStatus = 'payment_pending'
        break
      case 'rejected':
      case 'cancelled':
        newStatus = 'payment_failed'
        break
      default:
        newStatus = 'pending'
    }

    // Actualizar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Actualizar evaluación
    const { error: evalError } = await supabase
      .from('evaluaciones')
      .update({
        status: newStatus,
        mercadopago_payment_id: payment.id.toString(),
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluacionId)

    if (evalError) {
      console.error('Error actualizando evaluación:', evalError)
    }

    // Actualizar tabla de pagos si existe
    await supabase
      .from('pagos')
      .update({
        status: newStatus,
        payment_id: payment.id.toString(),
        payment_data: payment,
        updated_at: new Date().toISOString()
      })
      .eq('evaluacion_id', evaluacionId)

    // Si el pago fue aprobado, enviar notificación por WhatsApp
    if (paymentStatus === 'approved') {
      // Obtener datos de la evaluación para el mensaje
      const { data: evaluacion } = await supabase
        .from('evaluaciones')
        .select('nombre, telefono, email')
        .eq('id', evaluacionId)
        .single()

      if (evaluacion?.telefono) {
        // Llamar a función de WhatsApp (opcional)
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              telefono: evaluacion.telefono,
              template: 'pago_confirmado',
              variables: {
                nombre: evaluacion.nombre,
                monto: payment.transaction_amount
              }
            })
          })
        } catch (e) {
          console.log('WhatsApp notification skipped:', e)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        evaluacion_id: evaluacionId,
        new_status: newStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
