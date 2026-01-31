'use client'

import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "Por primera vez entendí exactamente qué tenía y por qué. El mapa de colores hizo todo más claro.",
    author: "María G.",
    context: "Evaluación para implantes",
    initials: "MG"
  },
  {
    quote: "Llegué con miedo y un presupuesto enorme de otra clínica. Acá me explicaron opciones que no conocía.",
    author: "Roberto S.",
    context: "Segunda opinión",
    initials: "RS"
  },
  {
    quote: "Vivo en Concepción. Hice la evaluación a distancia y cuando viajé ya sabía exactamente qué esperar.",
    author: "Carolina M.",
    context: "Paciente de región",
    initials: "CM"
  }
]

export default function Testimonials() {
  return (
    <section className="section-padding">
      <div className="container-miro">
        {/* Título */}
        <div className="text-center mb-12">
          <span className="text-sm font-mono text-miro-gold uppercase tracking-widest mb-4 block">
            Experiencias
          </span>
          <h2 className="heading-display text-3xl text-miro-white">
            Lo que dicen nuestros pacientes
          </h2>
        </div>

        {/* Testimonios */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 border border-white/5 bg-miro-gray-dark/30"
            >
              <Quote className="text-miro-gold/30 mb-4" size={24} />
              
              <p className="text-miro-white/80 mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-miro-gold/10 border border-miro-gold/30 flex items-center justify-center text-miro-gold text-sm font-medium">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-miro-white text-sm font-medium">
                    {testimonial.author}
                  </p>
                  <p className="text-miro-white/40 text-xs">
                    {testimonial.context}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
