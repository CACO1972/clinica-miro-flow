-- supabase/migrations/001_update_evaluaciones.sql
-- Actualizar tabla evaluaciones con campos para IA y pagos

-- Agregar columnas nuevas si no existen
ALTER TABLE evaluaciones
ADD COLUMN IF NOT EXISTS tipo_ruta text,
ADD COLUMN IF NOT EXISTS motivo_consulta text,
ADD COLUMN IF NOT EXISTS cuestionario_respuestas jsonb,
ADD COLUMN IF NOT EXISTS ia_ruta_sugerida text,
ADD COLUMN IF NOT EXISTS ia_resumen text,
ADD COLUMN IF NOT EXISTS ia_findings jsonb,
ADD COLUMN IF NOT EXISTS ia_confidence numeric,
ADD COLUMN IF NOT EXISTS tipo_imagen text DEFAULT 'panoramica',
ADD COLUMN IF NOT EXISTS precio integer DEFAULT 49000,
ADD COLUMN IF NOT EXISTS mercadopago_preference_id text,
ADD COLUMN IF NOT EXISTS mercadopago_payment_id text,
ADD COLUMN IF NOT EXISTS payment_status text,
ADD COLUMN IF NOT EXISTS dentalink_patient_id text,
ADD COLUMN IF NOT EXISTS dentalink_cita_id text;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_evaluaciones_status ON evaluaciones(status);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_email ON evaluaciones(email);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha_cita ON evaluaciones(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_created_at ON evaluaciones(created_at DESC);

-- Tabla de pagos (opcional pero recomendada)
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id uuid REFERENCES evaluaciones(id),
  monto integer NOT NULL,
  metodo text DEFAULT 'mercadopago',
  preference_id text,
  payment_id text,
  status text DEFAULT 'pending',
  payment_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_evaluacion ON pagos(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_status ON pagos(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS evaluaciones_updated_at ON evaluaciones;
CREATE TRIGGER evaluaciones_updated_at
  BEFORE UPDATE ON evaluaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS pagos_updated_at ON pagos;
CREATE TRIGGER pagos_updated_at
  BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas: los usuarios pueden ver sus propias evaluaciones por email
CREATE POLICY IF NOT EXISTS "Users can view own evaluaciones"
ON evaluaciones FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Las edge functions con service_role pueden hacer todo
CREATE POLICY IF NOT EXISTS "Service role full access evaluaciones"
ON evaluaciones FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role full access pagos"
ON pagos FOR ALL
USING (auth.role() = 'service_role');

-- Permitir insertar evaluaciones sin auth (para el flujo público)
CREATE POLICY IF NOT EXISTS "Anyone can insert evaluaciones"
ON evaluaciones FOR INSERT
WITH CHECK (true);

-- Comentarios
COMMENT ON COLUMN evaluaciones.tipo_ruta IS 'paciente_nuevo, paciente_antiguo, region_extranjero, segunda_opinion';
COMMENT ON COLUMN evaluaciones.ia_ruta_sugerida IS 'implantes, ortodoncia, caries, bruxismo, estetica';
COMMENT ON COLUMN evaluaciones.tipo_imagen IS 'panoramica o cbct';
COMMENT ON COLUMN evaluaciones.status IS 'pending, paid, scheduled, completed';
