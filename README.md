# Clínica Miró - Sistema de Decisión Clínica con IA

> Flujo conversacional único: Hero → IA educativo → Wizard → Evaluación Premium

## 🎯 Concepto

Esta NO es una página de servicios tradicional. Es un **sistema de decisión clínica asistido por IA** cuyo único objetivo es:
1. Precalificar al paciente
2. Orientarlo al camino más relevante
3. Llevarlo a una evaluación premium bien entendida y prepagada

## 📱 Secuencia del Flujo

```
1. HERO
   └── Mensaje: "Odontología predictiva"
   └── CTAs: "Empezar ahora" | "Ver cómo funciona"

2. MÓDULO IA (educación mínima)
   └── Bloque 1: Mapa de riesgo (verde/amarillo/rojo)
   └── Bloque 2: Explicación clara
   └── Bloque 3: Tú decides

3. WIZARD DE RUTAS
   └── Paciente nuevo
   └── Paciente antiguo
   └── Región / extranjero
   └── Segunda opinión

4. FLUJO ESPECÍFICO (4 pasos A-D)
   └── A: Cuestionario + datos → crea evaluación en Supabase
   └── B: Análisis IA → sugiere ruta (implantes/ortodoncia/etc)
   └── C: Explicación del camino → muestra contenido adaptativo
   └── D: Pago Mercado Pago + Agenda Dentalink

5. TRATAMIENTOS EXCLUSIVOS (solo visible sin flujo activo)
   └── ImplantOne, OrtoPro, ZeroCaries, Armonía, Sentia

6. TESTIMONIOS + LEGAL + FOOTER
```

## 🗂 Estructura de Archivos

```
clinica-miro/
├── app/
│   ├── globals.css        # Design system completo
│   ├── layout.tsx         # Metadata + layout base
│   └── page.tsx           # Orquestador de flujos
├── components/
│   ├── Hero.tsx           # Mensaje principal
│   ├── IAEducation.tsx    # 3 bloques educativos
│   ├── RouteWizard.tsx    # 4 tarjetas de ruta
│   ├── Treatments.tsx     # Tratamientos exclusivos
│   ├── Testimonials.tsx   # Experiencias
│   ├── LegalEthics.tsx    # Disclaimer legal
│   ├── Footer.tsx         # Footer simple
│   └── flows/
│       ├── NewPatientFlow.tsx      # Flujo completo 4 pasos
│       ├── ExistingPatientFlow.tsx # Redirige a Dentalink
│       ├── RemotePatientFlow.tsx   # Evaluación a distancia
│       ├── SecondOpinionFlow.tsx   # Segunda opinión
│       └── steps/
│           ├── QuestionnaireStep.tsx   # Paso A
│           ├── IaScreeningStep.tsx     # Paso B
│           ├── PathExplanationStep.tsx # Paso C
│           └── PremiumEvaluationStep.tsx # Paso D
├── lib/
│   └── supabase.ts        # Cliente + funciones API + contenido
└── types/
    └── index.ts           # Tipos TypeScript
```

## 🔌 Integraciones Pendientes

### Supabase (jipldlklzobiytkvxokf)
```sql
-- Tabla evaluaciones ya existe
-- Edge Functions pendientes:
POST /functions/v1/analyze-dental   -- Prediagnóstico IA
POST /functions/v1/analyze-rx       -- Análisis radiografías
POST /functions/v1/create-mercadopago
POST /functions/v1/webhook-mercadopago
```

### Mercado Pago
- Crear preferencia de pago con monto variable ($49k o $65k)
- Webhook para actualizar status en Supabase

### Dentalink
- Token: q9QsnoKG1tBoOZqJnvgqZ0tFIbH3LVNznPJWQPrJ
- Widget: https://ff.healthatom.io/41knMr
- Crear paciente + agendar hora programáticamente

## 💰 Lógica de Precios

| Tipo de imagen | Precio | Cuándo aplica |
|----------------|--------|---------------|
| Panorámica | $49,000 CLP | Evaluación general, caries, estética |
| CBCT | $65,000 CLP | Implantes, casos complejos |

La app decide automáticamente según:
- Motivo de consulta
- Respuestas del cuestionario (dientes sueltos, etc.)

## 🚀 Deploy

```bash
# 1. Instalar
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Editar con keys reales

# 3. Desarrollo
npm run dev

# 4. Deploy en Vercel
vercel --prod
```

## 📋 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://jipldlklzobiytkvxokf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui

# Mercado Pago (en edge functions)
MERCADOPAGO_ACCESS_TOKEN=...

# Dentalink (en lib/supabase.ts)
DENTALINK_TOKEN=q9QsnoKG1tBoOZqJnvgqZ0tFIbH3LVNznPJWQPrJ
```

## 🎨 Design System

```css
/* Colores */
--miro-black: #0A0A0A
--miro-gold: #C9A86C
--miro-blue: #1E3A5F

/* Tipografía */
Display: Playfair Display
Sans: DM Sans
Mono: JetBrains Mono

/* Indicadores de riesgo */
Verde: #22C55E (bajo riesgo)
Amarillo: #EAB308 (atención)
Rojo: #EF4444 (urgente)
```

---

*Clínica Miró · Primera clínica dental con IA en Chile*
*HUMANA.AI: Tecnología que humaniza la odontología*
