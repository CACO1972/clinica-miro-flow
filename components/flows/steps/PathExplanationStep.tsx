'use client'

import { CheckCircle2, ArrowRight } from 'lucide-react'
import { contenidoCaminos } from '@/lib/supabase'
import type { RutaSugerida, IaScreeningResponse } from '@/types'

interface PathExplanationStepProps {
  rutaSugerida: RutaSugerida
  iaSummary: IaScreeningResponse
  onComplete: () => void
}

export default function PathExplanationStep({
  rutaSugerida,
  iaSummary,
  onComplete,
}: PathExplanationStepProps) {
  const camino = contenidoCaminos[rutaSugerida]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header con icono del camino */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 text-4xl border-2 border-miro-gold mb-6">
          {camino.icono}
        </div>
        <h2 className="heading-display text-3xl md:text-4xl text-miro-white mb-2">
          {camino.titulo}
        </h2>
        <p className="text-miro-gold text-lg">
          {camino.subtitulo}
        </p>
      </div>

      {/* Descripción principal */}
      <div className="p-8 bg-white/5 border border-white/10 mb-8">
        <p className="text-miro-white/80 text-lg leading-relaxed">
          {camino.descripcion}
        </p>
      </div>

      {/* Puntos clave */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {camino.puntos.map((punto, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 border border-white/5 bg-miro-gray-dark/30"
          >
            <CheckCircle2 className="text-miro-gold flex-shrink-0 mt-0.5" size={18} />
            <span className="text-miro-white/70 text-sm">{punto}</span>
          </div>
        ))}
      </div>

      {/* Recordatorio del prediagnóstico */}
      <div className="p-6 border-l-4 border-miro-gold bg-miro-gold/5 mb-12">
        <p className="text-miro-white/70 text-sm mb-2">
          Según la IA, lo más importante en tu caso:
        </p>
        <p className="text-miro-white/90 italic">
          "{iaSummary.resumen_paciente}"
        </p>
      </div>

      {/* Bloque de transición a evaluación premium */}
      <div className="text-center p-8 border-2 border-miro-gold/30 bg-miro-gold/5">
        <h3 className="text-xl font-display font-semibold text-miro-white mb-4">
          Este es un prediagnóstico orientativo
        </h3>
        <p className="text-miro-white/60 mb-6 max-w-xl mx-auto">
          Para confirmar y diseñar tu plan definitivo, el siguiente paso es tu 
          <span className="text-miro-gold font-semibold"> evaluación premium</span>. 
          Incluye radiografía, análisis IA completo y 30 minutos con el dentista.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onComplete} className="btn-primary group">
            <span>Reservar mi evaluación premium</span>
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-miro-gold font-semibold text-lg">
            ${iaSummary.precio_evaluacion.toLocaleString('es-CL')} CLP
          </span>
        </div>
      </div>

      {/* Qué incluye */}
      <div className="mt-8 text-center">
        <p className="text-miro-white/40 text-sm mb-4">
          Tu evaluación premium incluye:
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-miro-white/50">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-miro-gold" />
            {iaSummary.tipo_imagen_requerida === 'cbct' ? 'CBCT 3D' : 'Radiografía panorámica'}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-miro-gold" />
            Análisis IA completo
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-miro-gold" />
            30 min con el dentista
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-miro-gold" />
            Documento "Explica"
          </span>
        </div>
      </div>
    </div>
  )
}
