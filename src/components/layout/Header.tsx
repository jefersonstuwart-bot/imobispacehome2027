import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, Menu, X, Search, Heart, GitCompareArrows } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import logo from '@/assets/logo-imobispace.png';

export function Header() {
  const { user, signOut, isAdmin, isBroker } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-4">
        <Link to="/" className="group flex h-16 w-[210px] items-center" onClick={close} aria-label="ImobiSpace Home — página inicial">
          <img src={logo} alt="ImobiSpace Home" width={1080} height={1080} decoding="async" className="block h-14 w-auto max-w-full object-contain object-left transition-transform duration-300 group-hover:scale-[1.03] md:h-16" />
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/lancamentos" className="nav-link">Lançamentos</Link>
          <Link to="/incorporadoras" className="nav-link">Incorporadoras</Link>
          <Link to="/sobre-nos" className="nav-link">Sobre nós</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/contato" className="nav-link">Contato</Link>
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-primary" title="Buscar imóveis"><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-primary" title="Favoritos"><Heart className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-primary" title="Comparar"><GitCompareArrows className="h-4 w-4" /></Button>
          {user && (isAdmin || isBroker) ? <Link to="/dashboard"><Button variant="ghost" size="sm" className="text-white/80"><LayoutDashboard className="h-4 w-4" /></Button></Link> : !user ? <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground"><LogIn className="h-4 w-4 mr-2" />Área do Corretor</Button></Link> : <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/70"><LogOut className="h-4 w-4" /></Button>}
        </div>
        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="lg:hidden border-t border-white/10 bg-black/95 px-6 py-6"><nav className="flex flex-col gap-5"><Link onClick={close} to="/lancamentos" className="mobile-nav-link">Lançamentos</Link><Link onClick={close} to="/incorporadoras" className="mobile-nav-link">Incorporadoras</Link><Link onClick={close} to="/sobre-nos" className="mobile-nav-link">Sobre nós</Link><Link onClick={close} to="/blog" className="mobile-nav-link">Blog</Link><Link onClick={close} to="/contato" className="mobile-nav-link">Contato</Link><Button onClick={() => { close(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-primary text-primary-foreground"><Search className="mr-2 h-4 w-4" />Buscar imóveis</Button></nav></div>}
    </header>
  );
}
