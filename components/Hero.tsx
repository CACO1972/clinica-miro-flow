'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToIA = () => {
    document.getElementById('ia-education')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToWizard = () => {
    document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background sutil */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, var(--miro-gold) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-miro-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-miro-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container-miro text-center py-20">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 mb-8 border border-miro-gold/30 bg-miro-gold/5 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="w-2 h-2 bg-miro-gold rounded-full animate-pulse" />
          <span className="text-sm text-miro-white/80 font-medium">Clínica Miró · Santiago, Chile</span>
        </div>

        {/* Título principal */}
        <h1
          className={`heading-display text-4xl md:text-6xl lg:text-7xl mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-miro-white">Odontología</span>
          <br />
          <span className="text-gold-gradient">predictiva</span>
        </h1>

        {/* Subtítulo */}
        <p
          className={`text-xl md:text-2xl text-miro-white/60 max-w-2xl mx-auto mb-4 font-light transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          La IA analiza tus exámenes. El dentista te explica qué significa.
          <br className="hidden md:block" />
          Tú decides qué hacer.
        </p>

        {/* Descripción breve */}
        <p
          className={`text-base text-miro-white/40 max-w-xl mx-auto mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          27 años de experiencia clínica + inteligencia artificial = decisiones informadas sobre tu salud dental.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button 
            onClick={scrollToWizard}
            className="btn-primary group"
          >
            <span>Empezar ahora</span>
            <ChevronDown size={18} className="ml-2 group-hover:translate-y-1 transition-transform" />
          </button>
          
          <button 
            onClick={scrollToIA}
            className="btn-secondary group"
          >
            <Play size={16} className="mr-2" />
            <span>Ver cómo funciona</span>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <ChevronDown size={20} className="animate-bounce text-miro-gold" />
      </div>
    </section>
  )
}
