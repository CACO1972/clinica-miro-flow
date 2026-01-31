# Edge Functions - Clínica Miró

Edge Functions de Supabase para el sistema de evaluación premium.

## Funciones Disponibles

### 1. `analyze-dental`
Prediagnóstico con IA basado en cuestionario clínico.

```bash
POST /functions/v1/analyze-dental
```

**Body:**
```json
{
  "evaluacion_id": "uuid",
  "motivo_consulta": "implantes|ortodoncia|caries|bruxismo|estetica",
  "cuestionario": {
    "dolor_actual": false,
    "dientes_sueltos": true,
    "sangrado_encias": false,
    ...
  },
  "imagen_url": "https://..." // opcional
}
```

**Response:**
```json
{
  "ruta_sugerida": "implantes",
  "resumen_paciente": "Texto explicativo...",
  "tipo_imagen_requerida": "cbct",
  "precio_evaluacion": 65000,
  "confidence": 0.85
}
```

### 2. `create-mercadopago`
Crear preferencia de pago en Mercado Pago.

```bash
POST /functions/v1/create-mercadopago
```

**Body:**
```json
{
  "evaluacion_id": "uuid",
  "monto": 49000,
  "email": "paciente@email.com",
  "nombre": "Juan Pérez",
  "tipo_evaluacion": "Evaluación Premium"
}
```

**Response:**
```json
{
  "success": true,
  "preference_id": "123456789",
  "init_point": "https://www.mercadopago.cl/checkout/..."
}
```

### 3. `webhook-mercadopago`
Webhook para recibir notificaciones IPN de Mercado Pago.

```bash
POST /functions/v1/webhook-mercadopago
```

Configurar en Mercado Pago:
- URL: `https://jipldlklzobiytkvxokf.supabase.co/functions/v1/webhook-mercadopago`
- Eventos: `payment`

### 4. `create-dentalink-patient`
Gestión de pacientes y citas en Dentalink.

```bash
# Crear paciente
POST /functions/v1/create-dentalink-patient?action=create_patient

# Obtener disponibilidad
POST /functions/v1/create-dentalink-patient?action=get_availability

# Agendar cita
POST /functions/v1/create-dentalink-patient?action=schedule
```

## Deploy

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Login
```bash
supabase login
```

### 3. Link al proyecto
```bash
supabase link --project-ref jipldlklzobiytkvxokf
```

### 4. Configurar secrets
```bash
# OpenAI para análisis IA
supabase secrets set OPENAI_API_KEY=sk-...

# Mercado Pago
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# Dentalink (opcional, ya está hardcodeado)
supabase secrets set DENTALINK_TOKEN=q9QsnoKG1tBoOZqJnvgqZ0tFIbH3LVNznPJWQPrJ

# URL del sitio para callbacks
supabase secrets set SITE_URL=https://clinicamiro.cl
```

### 5. Deploy funciones
```bash
# Deploy todas
supabase functions deploy

# Deploy una específica
supabase functions deploy analyze-dental
supabase functions deploy create-mercadopago
supabase functions deploy webhook-mercadopago
supabase functions deploy create-dentalink-patient
```

### 6. Ejecutar migraciones
```bash
supabase db push
```

## Variables de Entorno Requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENAI_API_KEY` | API key de OpenAI para GPT-4 | Sí (para IA real) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de Mercado Pago | Sí |
| `DENTALINK_TOKEN` | Token de API de Dentalink | Opcional (hay default) |
| `SITE_URL` | URL del sitio para callbacks | Sí |
| `SUPABASE_URL` | Auto-configurado por Supabase | Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configurado por Supabase | Auto |

## Testing Local

```bash
# Iniciar Supabase local
supabase start

# Servir funciones localmente
supabase functions serve

# Probar función
curl -X POST http://localhost:54321/functions/v1/analyze-dental \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"evaluacion_id": "test", "motivo_consulta": "implantes", "cuestionario": {}}'
```

## Flujo Completo

```
1. Usuario completa cuestionario
   ↓
2. Frontend llama POST /analyze-dental
   ↓
3. Edge Function analiza con GPT-4 (o reglas locales)
   ↓
4. Guarda resultado en tabla evaluaciones
   ↓
5. Usuario ve resultado y decide pagar
   ↓
6. Frontend llama POST /create-mercadopago
   ↓
7. Redirección a Mercado Pago
   ↓
8. Usuario paga
   ↓
9. Mercado Pago llama webhook-mercadopago
   ↓
10. Webhook actualiza status = 'paid'
    ↓
11. Usuario agenda cita via create-dentalink-patient
    ↓
12. Cita creada en Dentalink, status = 'scheduled'
```
