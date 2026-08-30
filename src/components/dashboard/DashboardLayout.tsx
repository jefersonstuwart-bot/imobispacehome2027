import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building2, Users, FileText, LogOut, ChevronRight, Loader2, Upload, Settings } from 'lucide-react';
import logo from '@/assets/logo-imobispace.png';

interface DashboardLayoutProps { children: ReactNode; }

const adminLinks = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/empreendimentos', label: 'Empreendimentos', icon: Building2 },
  { href: '/dashboard/importar-lote', label: 'Importar em Lote', icon: Upload },
  { href: '/dashboard/incorporadoras', label: 'Incorporadoras', icon: Building2 },
  { href: '/dashboard/configuracoes', label: 'Personalizar Site', icon: Settings },
  { href: '/dashboard/corretores', label: 'Corretores', icon: Users },
  { href: '/dashboard/propostas', label: 'Propostas', icon: FileText },
];

const brokerLinks = [{ href: '/dashboard/corretor', label: 'Minhas Propostas', icon: FileText }];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate('/auth'); }, [user, loading, navigate]);
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      const adminPaths = ['/dashboard/empreendimentos', '/dashboard/importar-lote', '/dashboard/incorporadoras', '/dashboard/configuracoes', '/dashboard/corretores', '/dashboard/propostas'];
      if (adminPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/dashboard') navigate('/dashboard/corretor');
    }
  }, [user, loading, isAdmin, location.pathname, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-muted"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null;
  const links = isAdmin ? adminLinks : brokerLinks;
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-muted flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border"><Link to="/" className="flex items-center gap-2 group"><img src={logo} alt="ImobiSpace Home" className="h-12 w-auto group-hover:scale-105 transition-transform" /></Link></div>
        <nav className="flex-1 p-4 space-y-1">{links.map((link) => { const isActive = location.pathname === link.href; return <Link key={link.href} to={link.href}><Button variant={isActive ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-3', isActive && 'bg-primary/10 text-primary hover:bg-primary/15')}><link.icon className="w-4 h-4" />{link.label}{isActive && <ChevronRight className="w-4 h-4 ml-auto" />}</Button></Link>; })}</nav>
        <div className="p-4 border-t border-border space-y-3"><div className="flex items-center gap-3 px-2"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-semibold text-primary">{profile?.name?.charAt(0).toUpperCase()}</span></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{profile?.name}</p><p className="text-xs text-muted-foreground truncate">{profile?.email}</p></div></div><Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}><LogOut className="w-4 h-4" />Sair</Button></div>
      </aside>
      <main className="flex-1 overflow-auto"><div className="p-8">{children}</div></main>
    </div>
  );
}
