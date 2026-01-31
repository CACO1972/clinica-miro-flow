'use client'

import { useState } from 'react'
import { CreditCard, Calendar, CheckCircle, Loader2, ExternalLink, Clock, MapPin } from 'lucide-react'
import { crearPreferenciaPago, obtenerHorariosDisponibles, agendarCita, dentalinkConfig } from '@/lib/supabase'
import type { IaScreeningResponse, DatosFormulario } from '@/types'

interface PremiumEvaluationStepProps {
  evaluacionId: string
  iaSummary: IaScreeningResponse
  datosFormulario: DatosFormulario
  onComplete: () => void
}

type SubStep = 'confirmation' | 'payment' | 'scheduling' | 'complete'

export default function PremiumEvaluationStep({
  evaluacionId,
  iaSummary,
  datosFormulario,
  onComplete,
}: PremiumEvaluationStepProps) {
  const [subStep, setSubStep] = useState<SubStep>('confirmation')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [appointmentDetails, setAppointmentDetails] = useState<{
    fecha: string
    hora: string
  } | null>(null)

  // Generar próximos 14 días disponibles (lunes a viernes)
  const getAvailableDates = () => {
    const dates: string[] = []
    const today = new Date()
    let count = 0
    
    while (dates.length < 10) {
      const date = new Date(today)
      date.setDate(today.getDate() + count)
      const day = date.getDay()
      
      // Solo lunes a viernes
      if (day !== 0 && day !== 6) {
        dates.push(date.toISOString().split('T')[0])
      }
      count++
    }
    
    return dates
  }

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setIsLoading(true)
    
    const times = await obtenerHorariosDisponibles(date)
    setAvailableTimes(times)
    setIsLoading(false)
  }

  const handleProceedToPayment = async () => {
    setIsLoading(true)
    
    const result = await crearPreferenciaPago(
      evaluacionId,
      iaSummary.precio_evaluacion,
      datosFormulario.email,
      datosFormulario.nombre_completo
    )

    if (result.success && result.initPoint) {
      // En producción, redirigir a Mercado Pago
      // window.location.href = result.initPoint
      
      // Por ahora, simular pago exitoso
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubStep('scheduling')
    }
    
    setIsLoading(false)
  }

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) return
    
    setIsLoading(true)
    
    const result = await agendarCita(
      evaluacionId,
      selectedDate,
      selectedTime,
      {
        nombre: datosFormulario.nombre_completo,
        email: datosFormulario.email,
        telefono: datosFormulario.telefono,
        rut: datosFormulario.documento_id
      }
    )

    if (result.success) {
      setAppointmentDetails({
        fecha: selectedDate,
        hora: selectedTime
      })
      setSubStep('complete')
    }
    
    setIsLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sub-step 1: Confirmación */}
      {subStep === 'confirmation' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="heading-display text-3xl text-miro-white mb-4">
              Tu evaluación premium
            </h2>
            <p className="text-miro-white/60">
              Revisa los detalles y procede al pago
            </p>
          </div>

          {/* Resumen de lo que incluye */}
          <div className="p-6 border border-miro-gold/30 bg-miro-gold/5">
            <h3 className="text-lg font-semibold text-miro-white mb-4">
              ¿Qué incluye tu evaluación?
            </h3>
            <ul className="space-y-3">
              {[
                iaSummary.tipo_imagen_requerida === 'cbct' 
                  ? 'CBCT (tomografía 3D) de alta resolución'
                  : 'Radiografía panorámica digital',
                'Análisis completo con inteligencia artificial',
                'Escaneo intraoral y facial si es necesario',
                '30 minutos de consulta con el Dr. Miró',
                'Documento "Explica" con diagnóstico y opciones',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-miro-gold flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-miro-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Datos del paciente */}
          <div className="p-6 bg-white/5 border border-white/10">
            <h4 className="text-sm text-miro-white/50 mb-3">Tus datos</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-miro-white/40">Nombre</span>
                <p className="text-miro-white">{datosFormulario.nombre_completo}</p>
              </div>
              <div>
                <span className="text-miro-white/40">Email</span>
                <p className="text-miro-white">{datosFormulario.email}</p>
              </div>
              <div>
                <span className="text-miro-white/40">Teléfono</span>
                <p className="text-miro-white">{datosFormulario.telefono}</p>
              </div>
              <div>
                <span className="text-miro-white/40">Prioridad detectada</span>
                <p className="text-miro-gold capitalize">{iaSummary.ruta_sugerida}</p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-6 bg-miro-gray-dark border border-white/10">
            <div>
              <span className="text-miro-white/60">Total a pagar</span>
              <p className="text-miro-white text-xs">
                Se abona al tratamiento si decides realizarlo
              </p>
            </div>
            <span className="text-3xl font-display font-bold text-miro-gold">
              ${iaSummary.precio_evaluacion.toLocaleString('es-CL')}
            </span>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard size={18} className="mr-2" />
                Pagar con Mercado Pago
              </>
            )}
          </button>

          <p className="text-center text-miro-white/30 text-xs">
            Pago seguro procesado por Mercado Pago
          </p>
        </div>
      )}

      {/* Sub-step 2: Agendamiento */}
      {subStep === 'scheduling' && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-miro-gold/10 border border-miro-gold rounded-full mb-4">
              <CheckCircle className="text-miro-gold" size={32} />
            </div>
            <h2 className="heading-display text-3xl text-miro-white mb-4">
              ¡Pago confirmado!
            </h2>
            <p className="text-miro-white/60">
              Ahora elige el día y hora para tu evaluación
            </p>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="block text-sm text-miro-white/60 mb-3">
              Selecciona un día
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {getAvailableDates().map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 text-center border transition-all ${
                    selectedDate === date
                      ? 'border-miro-gold bg-miro-gold/10'
                      : 'border-white/10 hover:border-miro-gold/50'
                  }`}
                >
                  <span className="text-xs text-miro-white/50 block">
                    {new Date(date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-semibold text-miro-white">
                    {new Date(date + 'T12:00:00').getDate()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de hora */}
          {selectedDate && (
            <div>
              <label className="block text-sm text-miro-white/60 mb-3">
                Selecciona una hora
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-miro-gold" />
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 text-center border transition-all ${
                        selectedTime === time
                          ? 'border-miro-gold bg-miro-gold text-miro-black font-semibold'
                          : 'border-white/10 text-miro-white/70 hover:border-miro-gold/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botón confirmar */}
          <button
            onClick={handleScheduleAppointment}
            disabled={!selectedDate || !selectedTime || isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Agendando...
              </>
            ) : (
              <>
                <Calendar size={18} className="mr-2" />
                Confirmar hora
              </>
            )}
          </button>
        </div>
      )}

      {/* Sub-step 3: Confirmación final */}
      {subStep === 'complete' && appointmentDetails && (
        <div className="text-center space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-miro-gold rounded-full mb-6">
              <CheckCircle className="text-miro-black" size={40} />
            </div>
            <h2 className="heading-display text-3xl text-miro-white mb-4">
              ¡Todo listo!
            </h2>
            <p className="text-miro-white/60">
              Tu evaluación premium está confirmada
            </p>
          </div>

          {/* Detalles de la cita */}
          <div className="p-8 border border-miro-gold bg-miro-gold/5">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-miro-gold">
                <Calendar size={20} />
                <span className="text-lg font-semibold capitalize">
                  {formatDate(appointmentDetails.fecha)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 text-miro-white">
                <Clock size={20} />
                <span className="text-2xl font-display font-bold">
                  {appointmentDetails.hora} hrs
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 text-miro-white/70">
                <MapPin size={20} />
                <span>Av. Nueva Providencia 2214, Of. 189</span>
              </div>
            </div>
          </div>

          {/* Resumen del prediagnóstico */}
          <div className="p-6 bg-white/5 border border-white/10 text-left">
            <h4 className="text-sm text-miro-white/50 mb-2">Tu prediagnóstico IA</h4>
            <p className="text-miro-white/80 text-sm italic">
              "{iaSummary.resumen_paciente}"
            </p>
          </div>

          {/* Qué traer */}
          <div className="text-left">
            <h4 className="text-sm text-miro-white/60 mb-3">Recuerda traer:</h4>
            <ul className="space-y-2 text-sm text-miro-white/70">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                Documento de identidad
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                Radiografías o exámenes previos (si tienes)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-miro-gold rounded-full" />
                Lista de medicamentos que tomas
              </li>
            </ul>
          </div>

          {/* Botón finalizar */}
          <button onClick={onComplete} className="btn-secondary">
            Volver al inicio
          </button>

          <p className="text-miro-white/30 text-xs">
            Recibirás un email de confirmación con todos los detalles
          </p>
        </div>
      )}
    </div>
  )
}
