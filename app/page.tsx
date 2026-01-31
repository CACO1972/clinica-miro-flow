'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import IAEducation from '@/components/IAEducation'
import RouteWizard from '@/components/RouteWizard'
import NewPatientFlow from '@/components/flows/NewPatientFlow'
import ExistingPatientFlow from '@/components/flows/ExistingPatientFlow'
import RemotePatientFlow from '@/components/flows/RemotePatientFlow'
import SecondOpinionFlow from '@/components/flows/SecondOpinionFlow'
import Treatments from '@/components/Treatments'
import Testimonials from '@/components/Testimonials'
import LegalEthics from '@/components/LegalEthics'
import Footer from '@/components/Footer'
import type { TipoRuta } from '@/types'

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<TipoRuta | null>(null)
  const [showFlow, setShowFlow] = useState(false)

  const handleRouteSelect = (route: TipoRuta) => {
    setSelectedRoute(route)
    setShowFlow(true)
    // Scroll suave al flujo
    setTimeout(() => {
      document.getElementById('flow-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleFlowComplete = () => {
    setShowFlow(false)
    setSelectedRoute(null)
  }

  const handleBackToWizard = () => {
    setShowFlow(false)
    setSelectedRoute(null)
    document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      {/* Hero - Mensaje central */}
      <Hero />

      {/* Módulo IA educativo - 3 bloques */}
      <IAEducation />

      {/* Wizard de rutas */}
      <section id="wizard-section">
        {!showFlow && (
          <RouteWizard onRouteSelect={handleRouteSelect} />
        )}
      </section>

      {/* Flujo específico según la ruta seleccionada */}
      {showFlow && selectedRoute && (
        <section id="flow-section" className="min-h-screen">
          {selectedRoute === 'paciente_nuevo' && (
            <NewPatientFlow 
              onComplete={handleFlowComplete}
              onBack={handleBackToWizard}
            />
          )}
          {selectedRoute === 'paciente_antiguo' && (
            <ExistingPatientFlow 
              onComplete={handleFlowComplete}
              onBack={handleBackToWizard}
            />
          )}
          {selectedRoute === 'region_extranjero' && (
            <RemotePatientFlow 
              onComplete={handleFlowComplete}
              onBack={handleBackToWizard}
            />
          )}
          {selectedRoute === 'segunda_opinion' && (
            <SecondOpinionFlow 
              onComplete={handleFlowComplete}
              onBack={handleBackToWizard}
            />
          )}
        </section>
      )}

      {/* Tratamientos exclusivos - Solo visible cuando no hay flujo activo */}
      {!showFlow && <Treatments />}

      {/* Testimonios */}
      {!showFlow && <Testimonials />}

      {/* Capa ética/legal */}
      {!showFlow && <LegalEthics />}

      {/* Footer */}
      <Footer />
    </main>
  )
}
