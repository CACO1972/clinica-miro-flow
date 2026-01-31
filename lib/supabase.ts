import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { 
  Evaluacion, 
  DatosFormulario, 
  IaScreeningResponse, 
  TipoRuta,
  TipoImagen,
  MotivoConsulta 
} from '@/types'

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jipldlklzobiytkvxokf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient | null = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// URL base para Edge Functions
const functionsUrl = `${supabaseUrl}/functions/v1`

// Precios de evaluación
export const PRECIOS = {
  panoramica: 49000,
  cbct: 65000
}

// Generar código de evaluación
function generateEvalId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Determinar tipo de imagen según motivo y cuestionario
export function determinarTipoImagen(
  motivo: MotivoConsulta, 
  cuestionario: DatosFormulario['cuestionario']
): TipoImagen {
  if (motivo === 'implantes') return 'cbct'
  if (cuestionario.dientes_sueltos && motivo !== 'caries') return 'cbct'
  return 'panoramica'
}

// ==================== API FUNCTIONS ====================

// Crear evaluación inicial (Paso A del flujo)
export async function crearEvaluacion(
  datos: DatosFormulario,
  tipoRuta: TipoRuta
): Promise<{ success: boolean; evaluacionId?: string; evalCode?: string; error?: string }> {
  
  const evalCode = generateEvalId()
  const tipoImagen = determinarTipoImagen(datos.motivo_consulta, datos.cuestionario)
  
  if (!supabase) {
    // Mock para desarrollo
    const mockId = `mock-${Date.now()}`
    console.log('Mock: Creando evaluación', { mockId, evalCode, datos, tipoRuta })
    return { success: true, evaluacionId: mockId, evalCode }
  }

  try {
    const { data, error } = await supabase
      .from('evaluaciones')
      .insert({
        eval_id: evalCode,
        tipo_ruta: tipoRuta,
        tipo: datos.motivo_consulta,
        nombre: datos.nombre_completo,
        email: datos.email,
        telefono: datos.telefono,
        rut: datos.documento_id,
        status: 'pending',
        motivo_consulta: datos.motivo_consulta,
        cuestionario_respuestas: datos.cuestionario,
        tipo_imagen: tipoImagen,
        precio: PRECIOS[tipoImagen]
      })
      .select('id, eval_id')
      .single()

    if (error) throw error

    return { 
      success: true, 
      evaluacionId: data.id, 
      evalCode: data.eval_id 
    }
  } catch (error) {
    console.error('Error creando evaluación:', error)
    return { success: false, error: 'Error al crear la evaluación' }
  }
}

// Llamar a IA para prediagnóstico (Paso B) - Usa Edge Function
export async function analizarConIA(
  evaluacionId: string,
  motivoConsulta: MotivoConsulta,
  cuestionario: DatosFormulario['cuestionario']
): Promise<IaScreeningResponse> {
  
  try {
    const response = await fetch(`${functionsUrl}/analyze-dental`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        evaluacion_id: evaluacionId,
        motivo_consulta: motivoConsulta,
        cuestionario
      })
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error llamando a analyze-dental:', error)
  }

  // Fallback local si la Edge Function falla
  return analyzeWithLocalRules(motivoConsulta, cuestionario)
}

// Análisis local de respaldo
function analyzeWithLocalRules(
  motivo: MotivoConsulta, 
  cuestionario: DatosFormulario['cuestionario']
): IaScreeningResponse {
  let ruta: IaScreeningResponse['ruta_sugerida'] = 'caries'
  let resumen = ''
  let tipoImagen: 'panoramica' | 'cbct' = 'panoramica'
  let precio = 49000

  if (motivo === 'implantes' || cuestionario.dientes_sueltos) {
    ruta = 'implantes'
    tipoImagen = 'cbct'
    precio = 65000
    resumen = 'Según tus respuestas, la rehabilitación con implantes podría ser una opción importante. Es fundamental evaluar el hueso disponible con una tomografía 3D.'
  } else if (motivo === 'ortodoncia') {
    ruta = 'ortodoncia'
    resumen = 'Tu caso sugiere que la alineación dental es prioridad. Con ortodoncia digital podemos simular el resultado final antes de empezar.'
  } else if (motivo === 'bruxismo' || cuestionario.dolor_actual) {
    ruta = 'bruxismo'
    resumen = 'Los síntomas pueden estar relacionados con bruxismo o tensión mandibular. Esto afecta tus dientes y calidad de sueño.'
  } else if (motivo === 'estetica') {
    ruta = 'estetica'
    resumen = 'Tu interés en mejorar la estética es un excelente punto de partida. Evaluaremos proporciones y armonía facial.'
  } else {
    resumen = 'Lo más importante es una evaluación completa para detectar caries y problemas de encías a tiempo.'
  }

  return {
    ruta_sugerida: ruta,
    resumen_paciente: resumen,
    tipo_imagen_requerida: tipoImagen,
    precio_evaluacion: precio
  }
}

// Actualizar evaluación con resultado de IA
export async function actualizarEvaluacionIA(
  evaluacionId: string,
  iaResponse: IaScreeningResponse
): Promise<boolean> {
  if (!supabase) return true

  try {
    const { error } = await supabase
      .from('evaluaciones')
      .update({
        ia_ruta_sugerida: iaResponse.ruta_sugerida,
        ia_resumen: iaResponse.resumen_paciente,
        tipo_imagen: iaResponse.tipo_imagen_requerida,
        precio: iaResponse.precio_evaluacion,
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluacionId)

    return !error
  } catch (error) {
    console.error('Error actualizando evaluación:', error)
    return false
  }
}

// Crear preferencia de pago en Mercado Pago - Usa Edge Function
export async function crearPreferenciaPago(
  evaluacionId: string,
  monto: number,
  email: string,
  nombre: string,
  tipoEvaluacion?: string
): Promise<{ success: boolean; initPoint?: string; preferenceId?: string; error?: string }> {
  
  try {
    const response = await fetch(`${functionsUrl}/create-mercadopago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        evaluacion_id: evaluacionId,
        monto,
        email,
        nombre,
        tipo_evaluacion: tipoEvaluacion || 'Evaluación Premium'
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        initPoint: data.init_point,
        preferenceId: data.preference_id
      }
    }

    const errorData = await response.json()
    return { success: false, error: errorData.error || 'Error creando pago' }

  } catch (error) {
    console.error('Error creando preferencia de pago:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

// Verificar estado de pago
export async function verificarPago(evaluacionId: string): Promise<boolean> {
  if (!supabase) return true

  try {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select('status')
      .eq('id', evaluacionId)
      .single()

    if (error) throw error
    return data.status === 'paid'
  } catch (error) {
    console.error('Error verificando pago:', error)
    return false
  }
}

// Obtener horarios disponibles - Usa Edge Function de Dentalink
export async function obtenerHorariosDisponibles(fecha: string): Promise<string[]> {
  try {
    const response = await fetch(`${functionsUrl}/create-dentalink-patient?action=get_availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ fecha })
    })

    if (response.ok) {
      const data = await response.json()
      return data.horarios || []
    }
  } catch (error) {
    console.error('Error obteniendo horarios:', error)
  }

  // Fallback: horarios mock
  return [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]
}

// Crear paciente en Dentalink
export async function crearPacienteDentalink(
  evaluacionId: string,
  datos: { nombre: string; email: string; telefono: string; rut?: string }
): Promise<{ success: boolean; dentalinkPatientId?: string; error?: string }> {
  
  try {
    const response = await fetch(`${functionsUrl}/create-dentalink-patient?action=create_patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        evaluacion_id: evaluacionId,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        rut: datos.rut
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        dentalinkPatientId: data.dentalink_patient_id
      }
    }

    const errorData = await response.json()
    return { success: false, error: errorData.error }

  } catch (error) {
    console.error('Error creando paciente en Dentalink:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

// Agendar cita en Dentalink
export async function agendarCita(
  evaluacionId: string,
  fecha: string,
  hora: string,
  datosPersonales: { nombre: string; email: string; telefono: string; rut?: string }
): Promise<{ success: boolean; dentalinkPatientId?: string; citaId?: string; error?: string }> {
  
  try {
    // Primero crear o buscar paciente
    const pacienteResult = await crearPacienteDentalink(evaluacionId, datosPersonales)
    
    if (!pacienteResult.success || !pacienteResult.dentalinkPatientId) {
      return { success: false, error: pacienteResult.error || 'Error creando paciente' }
    }

    // Luego agendar la cita
    const response = await fetch(`${functionsUrl}/create-dentalink-patient?action=schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        evaluacion_id: evaluacionId,
        dentalink_patient_id: pacienteResult.dentalinkPatientId,
        fecha,
        hora,
        duracion: 30,
        motivo: 'Evaluación Premium - Análisis IA'
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        dentalinkPatientId: pacienteResult.dentalinkPatientId,
        citaId: data.cita_id
      }
    }

    const errorData = await response.json()
    return { success: false, error: errorData.error }

  } catch (error) {
    console.error('Error agendando cita:', error)
    
    // Fallback: actualizar solo en Supabase
    if (supabase) {
      await supabase
        .from('evaluaciones')
        .update({
          status: 'scheduled',
          fecha_cita: `${fecha}T${hora}:00`,
          updated_at: new Date().toISOString()
        })
        .eq('id', evaluacionId)
    }
    
    return { success: true, dentalinkPatientId: `local_${Date.now()}` }
  }
}

// Configuración Dentalink (para widget)
export const dentalinkConfig = {
  token: 'q9QsnoKG1tBoOZqJnvgqZ0tFIbH3LVNznPJWQPrJ',
  sucursalId: 1,
  widgetUrl: 'https://ff.healthatom.io/41knMr'
}

// Contenido de los caminos de tratamiento
export const contenidoCaminos = {
  implantes: {
    titulo: 'Implant One',
    subtitulo: 'Implantes con planificación 3D y predicción de encía',
    descripcion: 'Usamos tomografía y software de planificación para colocar tus implantes en la posición exacta. Además, nuestra IA predice cómo se comportará tu encía alrededor del implante, para que el resultado sea predecible desde el primer día.',
    puntos: [
      'Planificación 3D con cirugía guiada',
      'Predicción del comportamiento de la encía',
      'Carga inmediata cuando es posible',
      'Seguimiento digital de osteointegración'
    ],
    icono: '⬡'
  },
  ortodoncia: {
    titulo: 'OrtoPro',
    subtitulo: 'Ortodoncia digital con índice de estabilidad',
    descripcion: 'No solo movemos dientes: te mostramos cómo quedará tu sonrisa antes de empezar, y te damos un índice de estabilidad (A, B o C) para que sepas qué tan probable es que el resultado se mantenga en el tiempo.',
    puntos: [
      'Simulación 3D del resultado final',
      'Índice de estabilidad A/B/C',
      'Alineadores transparentes o brackets según tu caso',
      'Seguimiento remoto con fotos desde tu celular'
    ],
    icono: '◈'
  },
  caries: {
    titulo: 'Cero Caries',
    subtitulo: 'Detección temprana y tratamiento mínimamente invasivo',
    descripcion: 'La IA analiza tus radiografías para detectar caries en etapas muy tempranas. Cuando las encontramos a tiempo, muchas veces podemos tratarlas sin taladro, usando técnicas de remineralización o micro-intervenciones.',
    puntos: [
      'Detección de caries con IA',
      'Tratamiento sin taladro cuando es posible',
      'Plan de prevención personalizado',
      'Seguimiento con fotos comparativas'
    ],
    icono: '◉'
  },
  bruxismo: {
    titulo: 'Sentia',
    subtitulo: 'Bruxismo, sueño y dolor orofacial',
    descripcion: 'El bruxismo no es solo apretar los dientes: está conectado con tu calidad de sueño, estrés y dolor de cabeza. Evaluamos todo el cuadro para darte soluciones que van más allá del típico plano de relajación.',
    puntos: [
      'Evaluación completa del patrón de bruxismo',
      'Relación con sueño y estrés',
      'Planos personalizados según tu caso',
      'Seguimiento de síntomas y mejoría'
    ],
    icono: '◎'
  },
  estetica: {
    titulo: 'Armonía',
    subtitulo: 'Diseño de sonrisa con análisis facial',
    descripcion: 'Tu sonrisa ideal no es una fórmula universal: depende de tu rostro, tus proporciones y lo que tú consideras bello. Usamos análisis facial con IA para diseñar una sonrisa que sea armónica contigo, no con un estándar genérico.',
    puntos: [
      'Análisis facial con IA (Simetría)',
      'Diseño digital de tu sonrisa',
      'Mockup para que veas el resultado antes',
      'Opciones desde blanqueamiento hasta carillas'
    ],
    icono: '✧'
  }
}
