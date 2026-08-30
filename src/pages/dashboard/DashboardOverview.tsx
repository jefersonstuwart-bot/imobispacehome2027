import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Users, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ProposalSimulator } from '@/components/dashboard/ProposalSimulator';
export default function DashboardOverview() {
  const { isAdmin } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [propertiesRes, proposalsRes, brokersRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact' }),
        supabase.from('proposals').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('id, status').eq('role', 'broker'),
      ]);

      const proposals = proposalsRes.data || [];
      const brokers = brokersRes.data || [];

      return {
        totalProperties: propertiesRes.count || 0,
        totalProposals: proposalsRes.count || 0,
        newProposals: proposals.filter(p => p.status === 'new').length,
        inProgressProposals: proposals.filter(p => p.status === 'in_progress').length,
        completedProposals: proposals.filter(p => p.status === 'completed').length,
        totalBrokers: brokers.length,
        onlineBrokers: brokers.filter(b => b.status === 'online').length,
      };
    },
    enabled: isAdmin,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os principais indicadores do seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empreendimentos
              </CardTitle>
              <Building2 className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Propostas
              </CardTitle>
              <FileText className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalProposals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Recebidas até agora
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Propostas Novas
              </CardTitle>
              <Clock className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats?.newProposals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Corretores Online
              </CardTitle>
              <Users className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {stats?.onlineBrokers || 0}
                <span className="text-lg text-muted-foreground font-normal">/{stats?.totalBrokers || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Disponíveis para atender
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Status das Propostas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm">Novas</span>
                </div>
                <span className="font-semibold">{stats?.newProposals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">Em Atendimento</span>
                </div>
                <span className="font-semibold">{stats?.inProgressProposals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm">Finalizadas</span>
                </div>
                <span className="font-semibold">{stats?.completedProposals || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="/dashboard/empreendimentos" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-medium">Novo Empreendimento</p>
                    <p className="text-xs text-muted-foreground">Cadastrar um novo imóvel</p>
                  </div>
                </div>
              </a>
              <a href="/dashboard/corretores" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Gerenciar Corretores</p>
                    <p className="text-xs text-muted-foreground">Adicionar ou editar corretores</p>
                  </div>
                </div>
              </a>
              <a href="/dashboard/propostas" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium">Ver Propostas</p>
                    <p className="text-xs text-muted-foreground">Acompanhar todas as propostas</p>
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Simulator - Admin Only */}
        <ProposalSimulator />
      </div>
    </DashboardLayout>
  );
}
