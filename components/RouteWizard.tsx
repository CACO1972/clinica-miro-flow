'use client'

import { UserPlus, User, Globe, FileSearch, ArrowRight } from 'lucide-react'
import type { TipoRuta } from '@/types'

interface RouteWizardProps {
  onRouteSelect: (route: TipoRuta) => void
}

const routes: Array<{
  id: TipoRuta
  icon: any
  title: string
  description: string
}> = [
  {
    id: 'paciente_nuevo',
    icon: UserPlus,
    title: 'Soy paciente nuevo',
    description: 'Quiero entender mi boca completa y saber por dónde partir.'
  },
  {
    id: 'paciente_antiguo',
    icon: User,
    title: 'Ya soy paciente',
    description: 'Quiero revisar cómo voy o planear un nuevo tratamiento.'
  },
  {
    id: 'region_extranjero',
    icon: Globe,
    title: 'Vivo en región o en el extranjero',
    description: 'Quiero planear mi tratamiento antes de viajar.'
  },
  {
    id: 'segunda_opinion',
    icon: FileSearch,
    title: 'Quiero una segunda opinión',
    description: 'Ya tengo diagnósticos o presupuestos y quiero mirarlos con calma.'
  }
]

export default function RouteWizard({ onRouteSelect }: RouteWizardProps) {
  return (
    <section className="section-padding">
      <div className="container-miro">
        {/* Título */}
        <div className="text-center mb-12">
          <span className="text-sm font-mono text-miro-gold uppercase tracking-widest mb-4 block">
            Empezar evaluación
          </span>
          <h2 className="heading-display text-3xl md:text-4xl text-miro-white mb-4">
            Elige cómo quieres empezar
          </h2>
          <p className="text-miro-white/50 max-w-md mx-auto">
            Cada camino está diseñado para darte la mejor experiencia según tu situación.
          </p>
        </div>

        {/* Tarjetas de rutas */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onRouteSelect(route.id)}
              className="group p-8 text-left border-2 border-white/10 bg-miro-black/50 hover:border-miro-gold hover:bg-miro-gold/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 border border-miro-gold/30 flex items-center justify-center group-hover:bg-miro-gold group-hover:border-miro-gold transition-all">
                  <route.icon 
                    size={24} 
                    className="text-miro-gold group-hover:text-miro-black transition-colors" 
                  />
                </div>
                <ArrowRight 
                  size={20} 
                  className="text-miro-white/20 group-hover:text-miro-gold group-hover:translate-x-1 transition-all" 
                />
              </div>

              <h3 className="text-xl font-display font-semibold text-miro-white mb-2 group-hover:text-miro-gold transition-colors">
                {route.title}
              </h3>
              
              <p className="text-miro-white/50 text-sm">
                {route.description}
              </p>
            </button>
          ))}
        </div>

        {/* Nota sobre precio */}
        <div className="text-center mt-12">
          <p className="text-miro-white/40 text-sm">
            Evaluación premium desde <span className="text-miro-gold font-semibold">$49.000 CLP</span>
            <br />
            <span className="text-xs">Incluye radiografía, análisis IA y 30 min con el dentista</span>
          </p>
        </div>
      </div>
    </section>
  )
}
