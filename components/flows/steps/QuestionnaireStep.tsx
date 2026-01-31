'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { crearEvaluacion } from '@/lib/supabase'
import type { DatosFormulario, MotivoConsulta, TipoRuta, CuestionarioClinico } from '@/types'

interface QuestionnaireStepProps {
  onComplete: (data: {
    evaluacionId: string
    motivoConsulta: MotivoConsulta
    datosFormulario: DatosFormulario
  }) => void
  tipoRuta: TipoRuta
}

const motivosConsulta: Array<{ value: MotivoConsulta; label: string }> = [
  { value: 'implantes', label: 'Me faltan dientes / Quiero implantes' },
  { value: 'ortodoncia', label: 'Quiero alinear mis dientes' },
  { value: 'caries', label: 'Tengo caries o dolor' },
  { value: 'bruxismo', label: 'Aprieto los dientes / Dolor de mandíbula' },
  { value: 'estetica', label: 'Quiero mejorar la estética de mi sonrisa' },
  { value: 'no_seguro', label: 'No estoy seguro, quiero evaluación completa' },
]

export default function QuestionnaireStep({ onComplete, tipoRuta }: QuestionnaireStepProps) {
  const [step, setStep] = useState<'datos' | 'cuestionario'>('datos')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos personales
  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais] = useState('Chile')
  const [motivo, setMotivo] = useState<MotivoConsulta | ''>('')

  // Cuestionario clínico
  const [cuestionario, setCuestionario] = useState<CuestionarioClinico>({
    dolor_actual: false,
    dientes_sueltos: false,
    sangrado_encias: false,
    usa_medicamentos: false,
    enfermedades_cronicas: false,
    ultima_visita_dentista: 'mas_1_ano',
    embarazo: false,
    fuma: false,
  })

  const handleDatosSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !email || !telefono || !motivo) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    setError(null)
    setStep('cuestionario')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCuestionarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const datosFormulario: DatosFormulario = {
      nombre_completo: nombre,
      documento_id: documento,
      email,
      telefono,
      ciudad,
      pais,
      motivo_consulta: motivo as MotivoConsulta,
      cuestionario,
    }

    try {
      const result = await crearEvaluacion(datosFormulario, tipoRuta)
      
      if (result.success && result.evaluacionId) {
        onComplete({
          evaluacionId: result.evaluacionId,
          motivoConsulta: motivo as MotivoConsulta,
          datosFormulario,
        })
      } else {
        setError(result.error || 'Error al crear la evaluación')
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateCuestionario = (key: keyof CuestionarioClinico, value: any) => {
    setCuestionario(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Título */}
      <div className="text-center mb-10">
        <h2 className="heading-display text-3xl text-miro-white mb-3">
          {step === 'datos' ? 'Cuéntanos sobre ti' : 'Cuestionario de salud'}
        </h2>
        <p className="text-miro-white/50">
          {step === 'datos' 
            ? 'Esta información nos ayuda a personalizar tu evaluación'
            : 'Responde honestamente para que la IA pueda orientarte mejor'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Paso 1: Datos personales */}
      {step === 'datos' && (
        <form onSubmit={handleDatosSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm text-miro-white/60 mb-2">
              Nombre completo *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miro-white/30" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field pl-12"
                placeholder="Tu nombre completo"
                required
              />
            </div>
          </div>

          {/* RUT/Documento */}
          <div>
            <label className="block text-sm text-miro-white/60 mb-2">
              RUT o Pasaporte
            </label>
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="input-field"
              placeholder="12.345.678-9"
            />
          </div>

          {/* Email y Teléfono */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-miro-white/60 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miro-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-miro-white/60 mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miro-white/30" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="input-field pl-12"
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ciudad y País */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-miro-white/60 mb-2">
                Ciudad
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miro-white/30" />
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Santiago"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-miro-white/60 mb-2">
                País
              </label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="input-field"
              >
                <option value="Chile">Chile</option>
                <option value="Argentina">Argentina</option>
                <option value="Peru">Perú</option>
                <option value="Colombia">Colombia</option>
                <option value="Mexico">México</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Motivo de consulta */}
          <div>
            <label className="block text-sm text-miro-white/60 mb-3">
              ¿Qué te trae por aquí? *
            </label>
            <div className="space-y-3">
              {motivosConsulta.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center p-4 border cursor-pointer transition-all ${
                    motivo === m.value
                      ? 'border-miro-gold bg-miro-gold/10'
                      : 'border-white/10 hover:border-miro-gold/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={m.value}
                    checked={motivo === m.value}
                    onChange={(e) => setMotivo(e.target.value as MotivoConsulta)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded-full mr-4 flex items-center justify-center ${
                    motivo === m.value ? 'border-miro-gold' : 'border-white/30'
                  }`}>
                    {motivo === m.value && (
                      <div className="w-2 h-2 bg-miro-gold rounded-full" />
                    )}
                  </div>
                  <span className="text-miro-white/80">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Continuar al cuestionario de salud
          </button>
        </form>
      )}

      {/* Paso 2: Cuestionario clínico */}
      {step === 'cuestionario' && (
        <form onSubmit={handleCuestionarioSubmit} className="space-y-6">
          <p className="text-sm text-miro-white/40 mb-6">
            Responde con honestidad. Esta información es confidencial y nos ayuda a orientarte mejor.
          </p>

          {/* Preguntas Sí/No */}
          {[
            { key: 'dolor_actual', label: '¿Tienes dolor dental en este momento?' },
            { key: 'dientes_sueltos', label: '¿Tienes dientes sueltos o has perdido alguno?' },
            { key: 'sangrado_encias', label: '¿Te sangran las encías al cepillarte?' },
            { key: 'usa_medicamentos', label: '¿Tomas medicamentos de forma regular?' },
            { key: 'enfermedades_cronicas', label: '¿Tienes alguna enfermedad crónica (diabetes, hipertensión, etc.)?' },
            { key: 'embarazo', label: '¿Estás embarazada o crees que podrías estarlo?' },
            { key: 'fuma', label: '¿Fumas o has fumado en los últimos 5 años?' },
          ].map((q) => (
            <div key={q.key} className="flex items-center justify-between p-4 border border-white/10">
              <span className="text-miro-white/80 text-sm">{q.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateCuestionario(q.key as keyof CuestionarioClinico, true)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    cuestionario[q.key as keyof CuestionarioClinico] === true
                      ? 'bg-miro-gold text-miro-black'
                      : 'bg-white/5 text-miro-white/60 hover:bg-white/10'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => updateCuestionario(q.key as keyof CuestionarioClinico, false)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    cuestionario[q.key as keyof CuestionarioClinico] === false
                      ? 'bg-miro-gold text-miro-black'
                      : 'bg-white/5 text-miro-white/60 hover:bg-white/10'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ))}

          {/* Última visita al dentista */}
          <div>
            <label className="block text-sm text-miro-white/60 mb-3">
              ¿Cuándo fue tu última visita al dentista?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'menos_6_meses', label: '< 6 meses' },
                { value: '6_12_meses', label: '6-12 meses' },
                { value: 'mas_1_ano', label: '1-3 años' },
                { value: 'mas_3_anos', label: '> 3 años' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateCuestionario('ultima_visita_dentista', option.value)}
                  className={`p-3 text-sm font-medium border transition-all ${
                    cuestionario.ultima_visita_dentista === option.value
                      ? 'border-miro-gold bg-miro-gold/10 text-miro-gold'
                      : 'border-white/10 text-miro-white/60 hover:border-miro-gold/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => setStep('datos')}
              className="btn-ghost flex-1"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                'Analizar con IA'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
