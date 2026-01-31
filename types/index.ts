// Tipos de rutas de pacientes
export type TipoRuta = 'paciente_nuevo' | 'paciente_antiguo' | 'region_extranjero' | 'segunda_opinion'

// Motivos de consulta
export type MotivoConsulta = 'implantes' | 'ortodoncia' | 'caries' | 'bruxismo' | 'estetica' | 'mixto' | 'no_seguro'

// Rutas sugeridas por IA
export type RutaSugerida = 'implantes' | 'ortodoncia' | 'caries' | 'bruxismo' | 'estetica'

// Estados del flujo
export type FlowStep = 'questionnaire' | 'ia_screening' | 'path_explanation' | 'premium_evaluation'

// Estado de pago
export type PaymentStatus = 'pending' | 'paid' | 'scheduled' | 'completed'

// Tipo de imagen requerida
export type TipoImagen = 'panoramica' | 'cbct'

// Datos del cuestionario clínico
export interface CuestionarioClinico {
  dolor_actual: boolean
  dientes_sueltos: boolean
  sangrado_encias: boolean
  usa_medicamentos: boolean
  enfermedades_cronicas: boolean
  ultima_visita_dentista: 'menos_6_meses' | '6_12_meses' | 'mas_1_ano' | 'mas_3_anos'
  embarazo: boolean
  fuma: boolean
}

// Datos del formulario inicial
export interface DatosFormulario {
  nombre_completo: string
  documento_id: string // RUT o pasaporte
  email: string
  telefono: string
  ciudad: string
  pais: string
  motivo_consulta: MotivoConsulta
  cuestionario: CuestionarioClinico
}

// Respuesta de la IA
export interface IaScreeningResponse {
  ruta_sugerida: RutaSugerida
  resumen_paciente: string
  tipo_imagen_requerida: TipoImagen
  precio_evaluacion: number
  findings?: Record<string, any>
}

// Evaluación en Supabase
export interface Evaluacion {
  id: string
  eval_id: string // Código ABC123
  patient_profile_id?: string
  tipo_ruta: TipoRuta
  tipo: string // implantologia, estetica, ortodoncia
  nombre: string
  email: string
  telefono: string
  rut?: string
  fecha_nacimiento?: string
  enfermedades?: string
  medicamentos?: string
  alergias?: string
  status: PaymentStatus
  fecha_cita?: string
  motivo_consulta?: MotivoConsulta
  cuestionario_respuestas?: CuestionarioClinico
  ia_ruta_sugerida?: RutaSugerida
  ia_resumen?: string
  tipo_imagen?: TipoImagen
  precio?: number
  dentalink_patient_id?: string
  created_at: string
  updated_at: string
}

// Props para componentes de flujo
export interface FlowStepProps {
  evaluacionId: string | null
  motivoConsulta: MotivoConsulta | null
  iaSummary: IaScreeningResponse | null
  onNext: (data?: any) => void
  onBack?: () => void
}

// Estado global del flujo
export interface FlowState {
  currentStep: FlowStep
  evaluacionId: string | null
  motivoConsulta: MotivoConsulta | null
  iaSummary: IaScreeningResponse | null
  datosFormulario: DatosFormulario | null
  tipoRuta: TipoRuta
}
