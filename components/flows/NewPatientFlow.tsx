'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import QuestionnaireStep from './steps/QuestionnaireStep'
import IaScreeningStep from './steps/IaScreeningStep'
import PathExplanationStep from './steps/PathExplanationStep'
import PremiumEvaluationStep from './steps/PremiumEvaluationStep'
import type { FlowStep, MotivoConsulta, IaScreeningResponse, DatosFormulario } from '@/types'

interface NewPatientFlowProps {
  onComplete: () => void
  onBack: () => void
}

const steps: Array<{ id: FlowStep; label: string; shortLabel: string }> = [
  { id: 'questionnaire', label: 'Datos y cuestionario', shortLabel: 'Datos' },
  { id: 'ia_screening', label: 'Análisis IA', shortLabel: 'IA' },
  { id: 'path_explanation', label: 'Tu camino', shortLabel: 'Camino' },
  { id: 'premium_evaluation', label: 'Evaluación premium', shortLabel: 'Reserva' },
]

export default function NewPatientFlow({ onComplete, onBack }: NewPatientFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('questionnaire')
  const [evaluacionId, setEvaluacionId] = useState<string | null>(null)
  const [motivoConsulta, setMotivoConsulta] = useState<MotivoConsulta | null>(null)
  const [iaSummary, setIaSummary] = useState<IaScreeningResponse | null>(null)
  const [datosFormulario, setDatosFormulario] = useState<DatosFormulario | null>(null)

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  // Handlers para cada paso
  const handleQuestionnaireComplete = (data: {
    evaluacionId: string
    motivoConsulta: MotivoConsulta
    datosFormulario: DatosFormulario
  }) => {
    setEvaluacionId(data.evaluacionId)
    setMotivoConsulta(data.motivoConsulta)
    setDatosFormulario(data.datosFormulario)
    setCurrentStep('ia_screening')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleIaComplete = (data: IaScreeningResponse) => {
    setIaSummary(data)
    setCurrentStep('path_explanation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePathComplete = () => {
    setCurrentStep('premium_evaluation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePremiumComplete = () => {
    onComplete()
  }

  const handleStepBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-miro-black">
      {/* Header con timeline */}
      <div className="sticky top-0 z-40 bg-miro-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="container-miro py-4">
          <div className="flex items-center justify-between">
            {/* Botón volver */}
            <button
              onClick={handleStepBack}
              className="flex items-center gap-2 text-miro-white/60 hover:text-miro-gold transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm hidden sm:inline">
                {currentStepIndex === 0 ? 'Elegir otra ruta' : 'Paso anterior'}
              </span>
            </button>

            {/* Timeline de pasos */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      index === currentStepIndex
                        ? 'bg-miro-gold text-miro-black'
                        : index < currentStepIndex
                        ? 'bg-miro-gold/20 text-miro-gold'
                        : 'bg-white/5 text-miro-white/40'
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-current/20 text-current">
                      {index + 1}
                    </span>
                    <span className="hidden md:inline">{step.shortLabel}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight size={16} className="mx-1 text-miro-white/20" />
                  )}
                </div>
              ))}
            </div>

            {/* Placeholder para balance */}
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="container-miro py-12">
        {currentStep === 'questionnaire' && (
          <QuestionnaireStep 
            onComplete={handleQuestionnaireComplete}
            tipoRuta="paciente_nuevo"
          />
        )}

        {currentStep === 'ia_screening' && evaluacionId && motivoConsulta && datosFormulario && (
          <IaScreeningStep
            evaluacionId={evaluacionId}
            motivoConsulta={motivoConsulta}
            cuestionario={datosFormulario.cuestionario}
            onComplete={handleIaComplete}
          />
        )}

        {currentStep === 'path_explanation' && iaSummary && (
          <PathExplanationStep
            rutaSugerida={iaSummary.ruta_sugerida}
            iaSummary={iaSummary}
            onComplete={handlePathComplete}
          />
        )}

        {currentStep === 'premium_evaluation' && evaluacionId && iaSummary && datosFormulario && (
          <PremiumEvaluationStep
            evaluacionId={evaluacionId}
            iaSummary={iaSummary}
            datosFormulario={datosFormulario}
            onComplete={handlePremiumComplete}
          />
        )}
      </div>
    </div>
  )
}
