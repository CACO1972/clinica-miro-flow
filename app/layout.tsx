import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica Miró | Odontología Predictiva con IA',
  description: 'Sistema de decisión clínica asistido por inteligencia artificial. Evaluación premium con diagnóstico IA, radiografía incluida y plan personalizado.',
  keywords: ['clinica dental', 'IA dental', 'odontologia predictiva', 'implantes', 'Santiago', 'Chile'],
  openGraph: {
    title: 'Clínica Miró | Odontología Predictiva con IA',
    description: 'Tu salud dental, guiada por inteligencia artificial',
    url: 'https://clinicamiro.cl',
    siteName: 'Clínica Miró',
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-miro-black text-miro-white antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
