'use client'

import { contenidoCaminos } from '@/lib/supabase'

const treatments = [
  { key: 'implantes', app: 'ImplantX' },
  { key: 'ortodoncia', app: 'OrtoPro' },
  { key: 'caries', app: 'ZeroCaries' },
  { key: 'estetica', app: 'Armonía + Simetría' },
  { key: 'bruxismo', app: 'Sentia' },
] as const

export default function Treatments() {
  return (
    <section className="section-padding bg-miro-gray-dark/20">
      <div className="container-miro">
        {/* Título */}
        <div className="text-center mb-16">
          <span className="text-sm font-mono text-miro-gold uppercase tracking-widest mb-4 block">
            Tratamientos exclusivos
          </span>
          <h2 className="heading-display text-3xl md:text-4xl text-miro-white mb-4">
            Tecnología + experiencia clínica
          </h2>
          <p className="text-miro-white/50 max-w-2xl mx-auto">
            Cada línea de tratamiento está respaldada por una app de IA específica 
            que potencia el diagnóstico y la planificación.
          </p>
        </div>

        {/* Grid de tratamientos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.map(({ key, app }) => {
            const content = contenidoCaminos[key as keyof typeof contenidoCaminos]
            return (
              <div
                key={key}
                className="p-6 border border-white/5 bg-miro-black/50 hover:border-miro-gold/30 transition-colors group"
              >
                {/* Icono */}
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {content.icono}
                </div>

                {/* Título y app */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-display font-semibold text-miro-white group-hover:text-miro-gold transition-colors">
                    {content.titulo}
                  </h3>
                  <span className="text-xs font-mono text-miro-gold/70 bg-miro-gold/10 px-2 py-1">
                    {app}
                  </span>
                </div>

                {/* Descripción corta */}
                <p className="text-miro-white/50 text-sm mb-4">
                  {content.subtitulo}
                </p>

                {/* 2 puntos clave */}
                <div className="space-y-2">
                  {content.puntos.slice(0, 2).map((punto, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-miro-white/40">
                      <span className="w-1 h-1 bg-miro-gold rounded-full" />
                      {punto}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-miro-white/40 text-sm">
            Todos los tratamientos comienzan con una evaluación premium
          </p>
        </div>
      </div>
    </section>
  )
}
