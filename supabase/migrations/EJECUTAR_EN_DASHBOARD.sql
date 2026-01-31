-- =====================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- Proyecto: jipldlklzobiytkvxokf
-- =====================================================

-- 1. Verificar si la tabla evaluaciones existe, si no, crearla
CREATE TABLE IF NOT EXISTS evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_id text UNIQUE,
  tipo text,
  nombre text,
  email text,
  telefono text,
  rut text,
  status text DEFAULT 'pending',
  fecha_cita timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Agregar columnas nuevas para el flujo conversacional
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

-- 3. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_evaluaciones_status ON evaluaciones(status);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_email ON evaluaciones(email);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha_cita ON evaluaciones(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_created_at ON evaluaciones(created_at DESC);

-- 4. Tabla de pagos
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

-- 5. Trigger para auto-actualizar updated_at
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

-- 6. Habilitar RLS
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acceso
-- Permitir insertar sin auth (flujo público)
DROP POLICY IF EXISTS "Anyone can insert evaluaciones" ON evaluaciones;
CREATE POLICY "Anyone can insert evaluaciones"
ON evaluaciones FOR INSERT
WITH CHECK (true);

-- Permitir leer las propias evaluaciones
DROP POLICY IF EXISTS "Anyone can read evaluaciones" ON evaluaciones;
CREATE POLICY "Anyone can read evaluaciones"
ON evaluaciones FOR SELECT
USING (true);

-- Permitir actualizar (para el webhook de MP)
DROP POLICY IF EXISTS "Anyone can update evaluaciones" ON evaluaciones;
CREATE POLICY "Anyone can update evaluaciones"
ON evaluaciones FOR UPDATE
USING (true);

-- Políticas para pagos
DROP POLICY IF EXISTS "Anyone can insert pagos" ON pagos;
CREATE POLICY "Anyone can insert pagos"
ON pagos FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read pagos" ON pagos;
CREATE POLICY "Anyone can read pagos"
ON pagos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can update pagos" ON pagos;
CREATE POLICY "Anyone can update pagos"
ON pagos FOR UPDATE
USING (true);

-- 8. Verificar estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'evaluaciones'
ORDER BY ordinal_position;
