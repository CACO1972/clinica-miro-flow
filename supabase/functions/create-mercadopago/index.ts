// supabase/functions/create-mercadopago/index.ts
// Crear preferencia de pago en Mercado Pago
// Deploy: supabase functions deploy create-mercadopago

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentRequest {
  evaluacion_id: string
  monto: number
  email: string
  nombre: string
  tipo_evaluacion: string
}

interface MercadoPagoPreference {
  id: string
  init_point: string
  sandbox_init_point: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { evaluacion_id, monto, email, nombre, tipo_evaluacion } = await req.json() as CreatePaymentRequest

    if (!evaluacion_id || !monto || !email || !nombre) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
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

    // Obtener URL base para callbacks
    const baseUrl = Deno.env.get('SITE_URL') || 'https://clinicamiro.cl'

    // Crear preferencia en Mercado Pago
    const preferenceData = {
      items: [
        {
          id: evaluacion_id,
          title: `Evaluación Premium - ${tipo_evaluacion || 'Clínica Miró'}`,
          description: monto === 65000 
            ? 'Evaluación con CBCT 3D, análisis IA y consulta de 30 min'
            : 'Evaluación con radiografía panorámica, análisis IA y consulta de 30 min',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: monto
        }
      ],
      payer: {
        email: email,
        name: nombre.split(' ')[0],
        surname: nombre.split(' ').slice(1).join(' ') || ''
      },
      back_urls: {
        success: `${baseUrl}/evaluacion/confirmacion?evaluacion_id=${evaluacion_id}&status=approved`,
        failure: `${baseUrl}/evaluacion/pago?evaluacion_id=${evaluacion_id}&status=failed`,
        pending: `${baseUrl}/evaluacion/pago?evaluacion_id=${evaluacion_id}&status=pending`
      },
      auto_return: 'approved',
      external_reference: evaluacion_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
      statement_descriptor: 'CLINICA MIRO',
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error('Error de Mercado Pago:', errorData)
      return new Response(
        JSON.stringify({ error: 'Error al crear preferencia de pago', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const preference: MercadoPagoPreference = await mpResponse.json()

    // Guardar preference_id en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase
      .from('evaluaciones')
      .update({
        mercadopago_preference_id: preference.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluacion_id)

    // También guardar en tabla de pagos si existe
    await supabase
      .from('pagos')
      .insert({
        evaluacion_id,
        monto,
        metodo: 'mercadopago',
        preference_id: preference.id,
        status: 'pending'
      })
      .select()
      .maybeSingle()

    return new Response(
      JSON.stringify({
        success: true,
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
