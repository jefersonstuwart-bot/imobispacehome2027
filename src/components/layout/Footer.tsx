import { Mail, Phone, MapPin, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-imobispace.png';

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-black rounded-xl p-3 shadow-lg border border-white/10">
                <img src={logo} alt="ImobiSpace Home" className="h-10 w-auto" />
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed font-light">
              Experiência imobiliária de alto padrão. Conectamos você aos empreendimentos selecionados no Paraná e em Santa Catarina.
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Crown className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-medium">Premium Experience</span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold text-primary">Contato Exclusivo</h4>
            <div className="space-y-4 text-sm text-white/60">
              <a href="mailto:imobispaceltda@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary/60" />
                imobispaceltda@gmail.com
              </a>
              <a href="https://wa.me/message/KWT6CLRH3G2MH1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary/60" />
                (41) 99548-2208
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">WhatsApp</span>
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary/60" />
                Paraná e Santa Catarina
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold text-primary">Atendimento</h4>
            <div className="space-y-2 text-sm text-white/60 font-light">
              <p>Segunda a Sexta: 9h às 19h</p>
              <p>Sábado: 9h às 14h</p>
              <p className="text-primary/80 font-medium mt-4">Atendimento personalizado em nossa região de atuação</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 tracking-wide">© {new Date().getFullYear()} ImobiSpace Home. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
