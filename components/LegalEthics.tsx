'use client'

import { Shield, Lock, Award } from 'lucide-react'

export default function LegalEthics() {
  return (
    <section className="section-padding bg-miro-gray-dark/30">
      <div className="container-miro">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="heading-display text-2xl text-miro-white mb-4">
              Compromiso ético y legal
            </h2>
            <p className="text-miro-white/50 text-sm max-w-2xl mx-auto">
              La tecnología potencia nuestro trabajo, pero las decisiones clínicas 
              siempre son tomadas por profesionales calificados.
            </p>
          </div>

          {/* Grid de puntos */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <Shield className="text-miro-gold mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-miro-white mb-2">IA como herramienta</h3>
              <p className="text-miro-white/50 text-sm">
                La inteligencia artificial asiste en el diagnóstico, pero no lo reemplaza. 
                Cada recomendación es revisada por el dentista.
              </p>
            </div>

            <div className="text-center p-6">
              <Lock className="text-miro-gold mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-miro-white mb-2">Datos protegidos</h3>
              <p className="text-miro-white/50 text-sm">
                Tu información clínica está cifrada y protegida según la normativa 
                chilena de datos personales.
              </p>
            </div>

            <div className="text-center p-6">
              <Award className="text-miro-gold mx-auto mb-4" size={32} />
              <h3 className="font-semibold text-miro-white mb-2">Propiedad intelectual</h3>
              <p className="text-miro-white/50 text-sm">
                HUMANA.AI es tecnología desarrollada en Chile, con patentes 
                en proceso de registro.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-6 border border-white/5 bg-miro-black/50">
            <p className="text-miro-white/40 text-xs text-center leading-relaxed">
              Los prediagnósticos generados por inteligencia artificial son orientativos y no 
              constituyen un diagnóstico médico definitivo. El diagnóstico final y plan de 
              tratamiento solo pueden ser determinados en una evaluación presencial por un 
              odontólogo titulado. Clínica Miró opera bajo la normativa del Ministerio de 
              Salud de Chile.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
