// supabase/functions/create-dentalink-patient/index.ts
// Crear paciente en Dentalink y agendar cita
// Deploy: supabase functions deploy create-dentalink-patient

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuración de Dentalink
const DENTALINK_API_URL = 'https://api.dentalink.healthatom.com/api/v1'
const DENTALINK_TOKEN = Deno.env.get('DENTALINK_TOKEN') || 'q9QsnoKG1tBoOZqJnvgqZ0tFIbH3LVNznPJWQPrJ'
const SUCURSAL_ID = 1

interface CreatePatientRequest {
  evaluacion_id: string
  nombre: string
  email: string
  telefono: string
  rut?: string
  fecha_nacimiento?: string
}

interface ScheduleAppointmentRequest {
  evaluacion_id: string
  dentalink_patient_id: string
  fecha: string // YYYY-MM-DD
  hora: string  // HH:MM
  duracion?: number // minutos, default 30
  motivo?: string
}

interface GetAvailabilityRequest {
  fecha: string // YYYY-MM-DD
  profesional_id?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'create_patient'
    const body = await req.json()

    switch (action) {
      case 'create_patient':
        return await createPatient(body as CreatePatientRequest)
      
      case 'get_availability':
        return await getAvailability(body as GetAvailabilityRequest)
      
      case 'schedule':
        return await scheduleAppointment(body as ScheduleAppointmentRequest)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Acción no válida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Crear paciente en Dentalink
async function createPatient(data: CreatePatientRequest) {
  const { evaluacion_id, nombre, email, telefono, rut, fecha_nacimiento } = data

  if (!nombre || !telefono) {
    return new Response(
      JSON.stringify({ error: 'Nombre y teléfono son requeridos' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Formatear nombre (Dentalink requiere nombres y apellidos separados)
  const nombreParts = nombre.trim().split(' ')
  const nombres = nombreParts.slice(0, Math.ceil(nombreParts.length / 2)).join(' ')
  const apellidos = nombreParts.slice(Math.ceil(nombreParts.length / 2)).join(' ') || nombreParts[0]

  // Formatear RUT si viene
  const rutFormateado = rut ? rut.replace(/[^0-9kK]/g, '').toUpperCase() : null

  // Crear paciente en Dentalink
  const patientData = {
    nombres,
    apellidos,
    email: email || null,
    telefono_movil: telefono.replace(/[^0-9+]/g, ''),
    rut: rutFormateado,
    fecha_nacimiento: fecha_nacimiento || null,
    id_sucursal: SUCURSAL_ID,
    origen: 'Web - Evaluación Premium'
  }

  const response = await fetch(`${DENTALINK_API_URL}/pacientes`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DENTALINK_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error creando paciente en Dentalink:', errorText)
    
    // Si el paciente ya existe (error de duplicado), intentar buscarlo
    if (response.status === 400 && errorText.includes('rut')) {
      return await findExistingPatient(rutFormateado, telefono, evaluacion_id)
    }
    
    return new Response(
      JSON.stringify({ error: 'Error creando paciente en Dentalink', details: errorText }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const patient = await response.json()
  const dentalinkPatientId = patient.data?.id || patient.id

  // Actualizar Supabase con el ID de Dentalink
  if (evaluacion_id) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase
      .from('evaluaciones')
      .update({
        dentalink_patient_id: dentalinkPatientId.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluacion_id)
  }

  return new Response(
    JSON.stringify({
      success: true,
      dentalink_patient_id: dentalinkPatientId,
      patient: patient.data || patient
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Buscar paciente existente
async function findExistingPatient(rut: string | null, telefono: string, evaluacion_id: string) {
  let searchParam = rut ? `rut=${rut}` : `telefono_movil=${telefono.replace(/[^0-9]/g, '')}`
  
  const response = await fetch(`${DENTALINK_API_URL}/pacientes?${searchParam}`, {
    headers: {
      'Authorization': `Token ${DENTALINK_TOKEN}`
    }
  })

  if (response.ok) {
    const result = await response.json()
    const patients = result.data || result
    
    if (patients && patients.length > 0) {
      const patient = patients[0]
      
      // Actualizar Supabase
      if (evaluacion_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase
          .from('evaluaciones')
          .update({
            dentalink_patient_id: patient.id.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', evaluacion_id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          dentalink_patient_id: patient.id,
          patient,
          existing: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Paciente no encontrado y no se pudo crear' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Obtener disponibilidad de horarios
async function getAvailability(data: GetAvailabilityRequest) {
  const { fecha, profesional_id } = data

  if (!fecha) {
    return new Response(
      JSON.stringify({ error: 'Fecha es requerida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Obtener citas del día para ver qué horarios están ocupados
  const params = new URLSearchParams({
    id_sucursal: SUCURSAL_ID.toString(),
    fecha_inicio: fecha,
    fecha_fin: fecha
  })

  if (profesional_id) {
    params.append('id_profesional', profesional_id.toString())
  }

  const response = await fetch(`${DENTALINK_API_URL}/citas?${params}`, {
    headers: {
      'Authorization': `Token ${DENTALINK_TOKEN}`
    }
  })

  // Horarios base de la clínica
  const horariosBase = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  let horariosOcupados: string[] = []

  if (response.ok) {
    const result = await response.json()
    const citas = result.data || result || []
    
    // Extraer horarios ocupados
    horariosOcupados = citas.map((cita: any) => {
      const hora = cita.fecha_hora?.split('T')[1]?.substring(0, 5) || cita.hora
      return hora
    }).filter(Boolean)
  }

  // Filtrar horarios disponibles
  const horariosDisponibles = horariosBase.filter(h => !horariosOcupados.includes(h))

  // Si es hoy, filtrar horarios pasados
  const hoy = new Date().toISOString().split('T')[0]
  if (fecha === hoy) {
    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    
    return new Response(
      JSON.stringify({
        fecha,
        horarios: horariosDisponibles.filter(h => {
          const [hh, mm] = h.split(':').map(Number)
          return (hh * 60 + mm) > horaActual + 60 // Al menos 1 hora de anticipación
        })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      fecha,
      horarios: horariosDisponibles
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Agendar cita
async function scheduleAppointment(data: ScheduleAppointmentRequest) {
  const { evaluacion_id, dentalink_patient_id, fecha, hora, duracion = 30, motivo } = data

  if (!dentalink_patient_id || !fecha || !hora) {
    return new Response(
      JSON.stringify({ error: 'Paciente, fecha y hora son requeridos' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Crear cita en Dentalink
  const citaData = {
    id_paciente: parseInt(dentalink_patient_id),
    id_sucursal: SUCURSAL_ID,
    fecha: fecha,
    hora: hora,
    duracion: duracion,
    estado: 'confirmada',
    motivo: motivo || 'Evaluación Premium - Análisis IA',
    notas: `Evaluación ID: ${evaluacion_id}`,
    // Si tienes un profesional específico, agrégalo aquí:
    // id_profesional: 1
  }

  const response = await fetch(`${DENTALINK_API_URL}/citas`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DENTALINK_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(citaData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error creando cita en Dentalink:', errorText)
    return new Response(
      JSON.stringify({ error: 'Error agendando cita', details: errorText }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const cita = await response.json()
  const citaId = cita.data?.id || cita.id

  // Actualizar Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  await supabase
    .from('evaluaciones')
    .update({
      status: 'scheduled',
      fecha_cita: `${fecha}T${hora}:00`,
      dentalink_cita_id: citaId?.toString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', evaluacion_id)

  return new Response(
    JSON.stringify({
      success: true,
      cita_id: citaId,
      fecha,
      hora,
      cita: cita.data || cita
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
