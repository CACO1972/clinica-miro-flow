import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="container-miro">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="mb-4">
              <span className="text-xl font-display font-bold">
                <span className="text-miro-white">CLÍNICA</span>
                <span className="text-gold-gradient ml-2">MIRÓ</span>
              </span>
            </div>
            <p className="text-miro-white/50 text-sm">
              Odontología predictiva con inteligencia artificial.
              <br />
              27 años de experiencia clínica.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-medium text-miro-white mb-4 uppercase tracking-wider">
              Contacto
            </h4>
            <div className="space-y-3 text-sm text-miro-white/60">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-miro-gold" />
                <span>Av. Nueva Providencia 2214, Of. 189</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-miro-gold" />
                <span>+56 2 2345 6789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-miro-gold" />
                <span>contacto@clinicamiro.cl</span>
              </div>
            </div>
          </div>

          {/* HUMANA.AI */}
          <div>
            <h4 className="text-sm font-medium text-miro-white mb-4 uppercase tracking-wider">
              HUMANA.AI
            </h4>
            <div className="space-y-2 text-sm text-miro-white/60">
              <a href="https://implantx-humana.vercel.app" target="_blank" rel="noopener" className="block hover:text-miro-gold">ImplantX</a>
              <a href="https://scandent-humana.vercel.app" target="_blank" rel="noopener" className="block hover:text-miro-gold">SCANDENT</a>
              <a href="https://armonia-humana.vercel.app" target="_blank" rel="noopener" className="block hover:text-miro-gold">Armonía</a>
              <a href="https://reage-phi.vercel.app" target="_blank" rel="noopener" className="block hover:text-miro-gold">Simetría</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-miro-white/30 text-xs">
            © {new Date().getFullYear()} Clínica Miró. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-miro-white/30">
            <a href="/privacidad" className="hover:text-miro-gold">Privacidad</a>
            <a href="/terminos" className="hover:text-miro-gold">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
