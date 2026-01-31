// supabase/functions/analyze-dental/index.ts
// Prediagnóstico IA basado en cuestionario clínico
// Deploy: supabase functions deploy analyze-dental

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CuestionarioClinico {
  dolor_actual: boolean
  dientes_sueltos: boolean
  sangrado_encias: boolean
  usa_medicamentos: boolean
  enfermedades_cronicas: boolean
  ultima_visita_dentista: string
  embarazo: boolean
  fuma: boolean
}

interface AnalyzeRequest {
  evaluacion_id: string
  motivo_consulta: string
  cuestionario: CuestionarioClinico
  imagen_url?: string
}

interface AnalyzeResponse {
  ruta_sugerida: 'implantes' | 'ortodoncia' | 'caries' | 'bruxismo' | 'estetica'
  resumen_paciente: string
  tipo_imagen_requerida: 'panoramica' | 'cbct'
  precio_evaluacion: number
  findings?: Record<string, any>
  confidence: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { evaluacion_id, motivo_consulta, cuestionario, imagen_url } = await req.json() as AnalyzeRequest

    if (!evaluacion_id || !motivo_consulta || !cuestionario) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    let iaResponse: AnalyzeResponse

    if (openaiKey) {
      iaResponse = await analyzeWithOpenAI(openaiKey, motivo_consulta, cuestionario, imagen_url)
    } else {
      iaResponse = analyzeWithRules(motivo_consulta, cuestionario)
    }

    // Guardar en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase
      .from('evaluaciones')
      .update({
        ia_ruta_sugerida: iaResponse.ruta_sugerida,
        ia_resumen: iaResponse.resumen_paciente,
        tipo_imagen: iaResponse.tipo_imagen_requerida,
        precio: iaResponse.precio_evaluacion,
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluacion_id)

    return new Response(
      JSON.stringify(iaResponse),
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

async function analyzeWithOpenAI(
  apiKey: string,
  motivo: string,
  cuestionario: CuestionarioClinico,
  imagenUrl?: string
): Promise<AnalyzeResponse> {
  
  const systemPrompt = `Eres un asistente de prediagnóstico dental de Clínica Miró. Analiza el cuestionario y sugiere la prioridad de tratamiento.

IMPORTANTE: Es un PREDIAGNÓSTICO orientativo, NO diagnóstico definitivo.

Responde SOLO con JSON:
{
  "ruta_sugerida": "implantes" | "ortodoncia" | "caries" | "bruxismo" | "estetica",
  "resumen_paciente": "2-3 oraciones explicando qué detectaste",
  "tipo_imagen_requerida": "panoramica" | "cbct",
  "precio_evaluacion": 49000 | 65000,
  "confidence": 0.0-1.0
}

Reglas:
- Dientes sueltos/faltantes → implantes (cbct, 65000)
- Motivo alineación → ortodoncia (panoramica, 49000)
- Dolor + sangrado → caries (panoramica, 49000)
- Bruxismo/mandíbula → bruxismo (panoramica, 49000)
- Estética → estetica (panoramica, 49000)`

  const userPrompt = `MOTIVO: ${motivo}

CUESTIONARIO:
- Dolor actual: ${cuestionario.dolor_actual ? 'Sí' : 'No'}
- Dientes sueltos/faltantes: ${cuestionario.dientes_sueltos ? 'Sí' : 'No'}
- Sangrado encías: ${cuestionario.sangrado_encias ? 'Sí' : 'No'}
- Medicamentos: ${cuestionario.usa_medicamentos ? 'Sí' : 'No'}
- Enfermedades crónicas: ${cuestionario.enfermedades_cronicas ? 'Sí' : 'No'}
- Última visita: ${cuestionario.ultima_visita_dentista}
- Embarazo: ${cuestionario.embarazo ? 'Sí' : 'No'}
- Fuma: ${cuestionario.fuma ? 'Sí' : 'No'}`

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  if (imagenUrl) {
    messages[1] = {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt + '\n\nAnaliza también esta imagen:' },
        { type: 'image_url', image_url: { url: imagenUrl } }
      ]
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: imagenUrl ? 'gpt-4o' : 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 500
    })
  })

  const data = await response.json()
  
  try {
    const content = data.choices[0].message.content
    const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    return analyzeWithRules(motivo, cuestionario)
  }
}

function analyzeWithRules(motivo: string, cuestionario: CuestionarioClinico): AnalyzeResponse {
  let ruta: AnalyzeResponse['ruta_sugerida'] = 'caries'
  let resumen = ''
  let tipoImagen: 'panoramica' | 'cbct' = 'panoramica'
  let precio = 49000

  if (motivo === 'implantes' || cuestionario.dientes_sueltos) {
    ruta = 'implantes'
    tipoImagen = 'cbct'
    precio = 65000
    resumen = 'Según tus respuestas, la rehabilitación con implantes podría ser importante. Es fundamental evaluar el hueso disponible con una tomografía 3D para planificar correctamente.'
  } else if (motivo === 'ortodoncia') {
    ruta = 'ortodoncia'
    resumen = 'Tu caso sugiere que la alineación dental es prioridad. Con ortodoncia digital podemos simular el resultado final y darte un índice de estabilidad.'
  } else if (motivo === 'bruxismo' || cuestionario.dolor_actual) {
    ruta = 'bruxismo'
    resumen = 'Los síntomas pueden estar relacionados con bruxismo o tensión mandibular. Esto afecta tus dientes y calidad de sueño.'
  } else if (motivo === 'estetica') {
    ruta = 'estetica'
    resumen = 'Tu interés en mejorar la estética es un excelente punto de partida. Evaluaremos proporciones y armonía facial.'
  } else {
    resumen = 'Lo más importante es una evaluación completa para detectar caries y problemas de encías a tiempo. Muchas lesiones pueden tratarse sin taladro si se detectan temprano.'
  }

  if (cuestionario.fuma) {
    resumen += ' El tabaquismo es un factor de riesgo que evaluaremos.'
  }

  return {
    ruta_sugerida: ruta,
    resumen_paciente: resumen,
    tipo_imagen_requerida: tipoImagen,
    precio_evaluacion: precio,
    confidence: 0.8,
    findings: {
      factores_riesgo: {
        fuma: cuestionario.fuma,
        enfermedades_cronicas: cuestionario.enfermedades_cronicas
      }
    }
  }
}
