'use client'

import { ArrowLeft, User, Calendar, FileText } from 'lucide-react'

interface FlowProps {
  onComplete: () => void
  onBack: () => void
}

// Flujo para paciente existente
export function ExistingPatientFlow({ onComplete, onBack }: FlowProps) {
  return (
    <div className="min-h-screen bg-miro-black">
      <div className="container-miro py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-miro-white/60 hover:text-miro-gold transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Elegir otra ruta</span>
        </button>

        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-miro-gold mb-6">
            <User className="text-miro-gold" size={32} />
          </div>
          
          <h2 className="heading-display text-3xl text-miro-white mb-4">
            Bienvenido de vuelta
          </h2>
          
          <p className="text-miro-white/60 mb-8">
            Si ya eres paciente de Clínica Miró, puedes agendar directamente o 
            revisar el estado de tu tratamiento.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <a
              href="https://ff.healthatom.io/41knMr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 border border-white/10 hover:border-miro-gold transition-colors"
            >
              <Calendar className="text-miro-gold mx-auto mb-3" size={24} />
              <h3 className="font-semibold text-miro-white mb-2">Agendar hora</h3>
              <p className="text-miro-white/50 text-sm">Control o nuevo tratamiento</p>
            </a>
            
            <a
              href="tel:+56223456789"
              className="p-6 border border-white/10 hover:border-miro-gold transition-colors"
            >
              <FileText className="text-miro-gold mx-auto mb-3" size={24} />
              <h3 className="font-semibold text-miro-white mb-2">Consultar estado</h3>
              <p className="text-miro-white/50 text-sm">Llamar para revisar tu caso</p>
            </a>
          </div>

          <p className="text-miro-white/40 text-sm">
            ¿No encuentras tu ficha? Llámanos al +56 2 2345 6789
          </p>
        </div>
      </div>
    </div>
  )
}

// Flujo para paciente de región/extranjero
export function RemotePatientFlow({ onComplete, onBack }: FlowProps) {
  return (
    <div className="min-h-screen bg-miro-black">
      <div className="container-miro py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-miro-white/60 hover:text-miro-gold transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Elegir otra ruta</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-display text-3xl text-miro-white mb-4">
              Planifica a distancia, decide cuándo viajar
            </h2>
            <p className="text-miro-white/60">
              Nos envías tus exámenes y fotos, la IA ordena la información y un dentista 
              revisa tu caso. Te proponemos opciones y una estimación de tiempos, para que 
              vengas a Santiago solo con un plan claro.
            </p>
          </div>

          <div className="p-6 border border-miro-gold/30 bg-miro-gold/5 mb-8">
            <h3 className="font-semibold text-miro-white mb-4">Cómo funciona:</h3>
            <ol className="space-y-4">
              {[
                'Completas un cuestionario y subes tus exámenes existentes',
                'Nuestro equipo + IA analiza tu caso a distancia',
                'Recibes un informe con opciones y tiempos estimados',
                'Decides si y cuándo viajar a Santiago',
                'Cuando llegues, ya tenemos todo preparado'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-miro-gold text-miro-black text-sm font-semibold rounded-full flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-miro-white/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 mb-8">
            <p className="text-miro-white/70 text-sm">
              <strong className="text-miro-gold">Importante:</strong> Si necesitas estudios 
              nuevos (como CBCT), te diremos exactamente cuáles, para que los tomes donde 
              estés o en tu primera visita.
            </p>
          </div>

          <button 
            onClick={onBack}
            className="btn-primary w-full"
          >
            Empezar mi evaluación a distancia
          </button>
          
          <p className="text-center text-miro-white/40 text-sm mt-4">
            Evaluación a distancia: $49.000 CLP
          </p>
        </div>
      </div>
    </div>
  )
}

// Flujo para segunda opinión
export function SecondOpinionFlow({ onComplete, onBack }: FlowProps) {
  return (
    <div className="min-h-screen bg-miro-black">
      <div className="container-miro py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-miro-white/60 hover:text-miro-gold transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span>Elegir otra ruta</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-display text-3xl text-miro-white mb-4">
              Segunda opinión profesional
            </h2>
            <p className="text-miro-white/60">
              Ya tienes un diagnóstico o presupuesto de otro lugar. Queremos ayudarte 
              a entenderlo mejor y evaluar si hay otras opciones.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="p-6 border border-white/10">
              <h3 className="font-semibold text-miro-white mb-3">¿Qué puedes traer?</h3>
              <ul className="space-y-2 text-miro-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Radiografías o scanner (digitales o físicas)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Presupuesto o plan de tratamiento que te dieron
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Cualquier informe o diagnóstico escrito
                </li>
              </ul>
            </div>

            <div className="p-6 border border-miro-gold/30 bg-miro-gold/5">
              <h3 className="font-semibold text-miro-white mb-3">¿Qué recibes?</h3>
              <ul className="space-y-2 text-miro-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Revisión de tus exámenes con análisis IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Opinión profesional independiente
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Explicación clara de opciones y sus diferencias
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                  Sin presión para tratarte con nosotros
                </li>
              </ul>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="btn-primary w-full"
          >
            Solicitar segunda opinión
          </button>
          
          <p className="text-center text-miro-white/40 text-sm mt-4">
            Segunda opinión: $49.000 CLP (incluye radiografía nueva si es necesaria)
          </p>
        </div>
      </div>
    </div>
  )
}

export default { ExistingPatientFlow, RemotePatientFlow, SecondOpinionFlow }
