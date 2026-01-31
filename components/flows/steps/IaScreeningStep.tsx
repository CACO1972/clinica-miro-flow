'use client'

import { useEffect, useState } from 'react'
import { Brain, CheckCircle } from 'lucide-react'
import { analizarConIA, actualizarEvaluacionIA } from '@/lib/supabase'
import type { MotivoConsulta, CuestionarioClinico, IaScreeningResponse } from '@/types'

interface IaScreeningStepProps {
  evaluacionId: string
  motivoConsulta: MotivoConsulta
  cuestionario: CuestionarioClinico
  onComplete: (data: IaScreeningResponse) => void
}

const analysisSteps = [
  'Analizando respuestas del cuestionario...',
  'Identificando patrones de riesgo...',
  'Determinando prioridad clínica...',
  'Generando recomendación personalizada...',
]

export default function IaScreeningStep({
  evaluacionId,
  motivoConsulta,
  cuestionario,
  onComplete,
}: IaScreeningStepProps) {
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<IaScreeningResponse | null>(null)

  useEffect(() => {
    let mounted = true

    const runAnalysis = async () => {
      // Simular progreso de análisis
      for (let i = 0; i < analysisSteps.length; i++) {
        if (!mounted) return
        setCurrentAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Llamar a la IA
      const iaResult = await analizarConIA(evaluacionId, motivoConsulta, cuestionario)
      
      if (!mounted) return

      // Actualizar en Supabase
      await actualizarEvaluacionIA(evaluacionId, iaResult)

      setResult(iaResult)
      setIsComplete(true)
    }

    runAnalysis()

    return () => {
      mounted = false
    }
  }, [evaluacionId, motivoConsulta, cuestionario])

  const handleContinue = () => {
    if (result) {
      onComplete(result)
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Icono animado */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className={`absolute inset-0 border-2 rounded-full ${
          isComplete ? 'border-miro-gold' : 'border-miro-gold/30'
        }`} />
        <div className={`absolute inset-2 border-2 rounded-full ${
          isComplete ? 'border-miro-gold/50' : 'border-miro-gold/20'
        } ${!isComplete ? 'animate-pulse' : ''}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <CheckCircle className="text-miro-gold" size={40} />
          ) : (
            <Brain className="text-miro-gold animate-pulse" size={40} />
          )}
        </div>
      </div>

      {/* Título */}
      <h2 className="heading-display text-3xl text-miro-white mb-4">
        {isComplete ? 'Análisis completado' : 'Analizando con IA'}
      </h2>

      {/* Estado del análisis */}
      {!isComplete && (
        <div className="space-y-4 mb-8">
          {analysisSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 justify-center transition-all duration-500 ${
                index <= currentAnalysisStep ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index < currentAnalysisStep 
                  ? 'bg-miro-gold' 
                  : index === currentAnalysisStep 
                    ? 'bg-miro-gold animate-pulse' 
                    : 'bg-white/20'
              }`} />
              <span className="text-miro-white/70 text-sm">{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Resultado */}
      {isComplete && result && (
        <div className="text-left space-y-6 mb-8">
          {/* Ruta sugerida */}
          <div className="p-6 border border-miro-gold/30 bg-miro-gold/5">
            <span className="text-sm text-miro-gold font-mono uppercase tracking-wider">
              Prioridad detectada
            </span>
            <h3 className="text-2xl font-display font-semibold text-miro-white mt-2 capitalize">
              {result.ruta_sugerida === 'caries' ? 'Salud dental general' : result.ruta_sugerida}
            </h3>
          </div>

          {/* Resumen */}
          <div className="p-6 bg-white/5 border border-white/10">
            <p className="text-miro-white/80 leading-relaxed">
              {result.resumen_paciente}
            </p>
          </div>

          {/* Info de la evaluación */}
          <div className="flex items-center justify-between p-4 bg-miro-gray-dark/50 border border-white/5">
            <span className="text-miro-white/60 text-sm">
              Evaluación recomendada
            </span>
            <div className="text-right">
              <span className="text-miro-gold font-semibold">
                ${result.precio_evaluacion.toLocaleString('es-CL')} CLP
              </span>
              <span className="text-miro-white/40 text-xs block">
                Incluye {result.tipo_imagen_requerida === 'cbct' ? 'CBCT' : 'radiografía panorámica'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón continuar */}
      {isComplete && (
        <button onClick={handleContinue} className="btn-primary">
          Ver qué significa esto para mí
        </button>
      )}

      {/* Disclaimer */}
      <p className="text-miro-white/30 text-xs mt-8 max-w-md mx-auto">
        Este es un prediagnóstico orientativo basado en tus respuestas. 
        El diagnóstico definitivo se realiza en la evaluación presencial.
      </p>
    </div>
  )
}
