'use client'

import { Map, MessageSquare, Users } from 'lucide-react'

const iaBlocks = [
  {
    icon: Map,
    title: 'Tu mapa de riesgo',
    description: 'Tus radiografías se convierten en un mapa simple: piezas en verde, amarillo o rojo según su riesgo. Lo vemos juntos en pantalla.',
    visual: (
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-6 h-6 rounded risk-green flex items-center justify-center text-xs font-mono">16</div>
        <div className="w-6 h-6 rounded risk-green flex items-center justify-center text-xs font-mono">15</div>
        <div className="w-6 h-6 rounded risk-yellow flex items-center justify-center text-xs font-mono">14</div>
        <div className="w-6 h-6 rounded risk-red flex items-center justify-center text-xs font-mono">13</div>
        <div className="w-6 h-6 rounded risk-green flex items-center justify-center text-xs font-mono">12</div>
        <div className="w-6 h-6 rounded risk-green flex items-center justify-center text-xs font-mono">11</div>
      </div>
    )
  },
  {
    icon: MessageSquare,
    title: 'Explicación clara',
    description: 'La IA marca zonas de riesgo. El dentista las revisa y te explica con palabras simples qué significa cada color.',
    visual: (
      <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded text-sm text-miro-white/60 italic">
        "El diente 14 muestra pérdida de hueso. Esto no es urgente, pero conviene tratarlo antes de que avance."
      </div>
    )
  },
  {
    icon: Users,
    title: 'Tú decides',
    description: 'No damos órdenes. Te mostramos opciones con sus ventajas y riesgos, y eliges junto al equipo qué camino seguir.',
    visual: (
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-miro-gold rounded-full" />
          <span className="text-miro-white/60">Opción A: Tratamiento conservador</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-miro-blue rounded-full" />
          <span className="text-miro-white/60">Opción B: Intervención temprana</span>
        </div>
      </div>
    )
  }
]

export default function IAEducation() {
  return (
    <section id="ia-education" className="section-padding bg-miro-gray-dark/30">
      <div className="container-miro">
        {/* Título */}
        <div className="text-center mb-16">
          <span className="text-sm font-mono text-miro-gold uppercase tracking-widest mb-4 block">
            Inteligencia Artificial
          </span>
          <h2 className="heading-display text-3xl md:text-4xl text-miro-white">
            Cómo usamos la IA en tu caso
          </h2>
        </div>

        {/* 3 Bloques */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {iaBlocks.map((block, index) => (
            <div 
              key={index}
              className="p-8 border border-white/5 bg-miro-black/50 hover:border-miro-gold/20 transition-colors"
            >
              {/* Icono */}
              <div className="w-12 h-12 border border-miro-gold/30 flex items-center justify-center mb-6">
                <block.icon className="text-miro-gold" size={24} />
              </div>

              {/* Contenido */}
              <h3 className="text-lg font-display font-semibold text-miro-white mb-3">
                {block.title}
              </h3>
              <p className="text-miro-white/60 text-sm leading-relaxed">
                {block.description}
              </p>

              {/* Visual */}
              {block.visual}
            </div>
          ))}
        </div>

        {/* Mensaje final */}
        <p className="text-center text-miro-white/40 text-sm mt-12 max-w-2xl mx-auto">
          La IA es una herramienta, no un reemplazo del criterio clínico. 
          Cada recomendación es revisada por un dentista antes de llegar a ti.
        </p>
      </div>
    </section>
  )
}
