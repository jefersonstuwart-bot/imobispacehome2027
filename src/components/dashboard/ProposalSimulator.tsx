import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FlaskConical, Send, UserCheck } from 'lucide-react';
import { PROPOSAL_TYPE_LABELS, MARITAL_STATUS_LABELS } from '@/lib/constants';

export function ProposalSimulator() {
  const queryClient = useQueryClient();
  const [manualAssign, setManualAssign] = useState(false);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('');
  const [formData, setFormData] = useState({
    property_id: '',
    client_name: 'Cliente Teste',
    client_cpf: '123.456.789-00',
    client_rg: '12.345.678-9',
    client_phone: '(11) 99999-9999',
    client_email: 'teste@exemplo.com',
    client_marital_status: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    proposal_type: 'financed' as 'cash' | 'financed',
    proposal_value: 350000,
    proposal_description: 'Proposta simulada para teste do sistema',
  });

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties-for-simulator'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, location')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: onlineBrokers } = useQuery({
    queryKey: ['online-brokers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'broker')
        .eq('is_active', true)
        .eq('status', 'online');
      if (error) throw error;
      return data;
    },
  });

  const { data: allBrokers } = useQuery({
    queryKey: ['all-brokers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, status')
        .eq('role', 'broker')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      if (!formData.property_id) {
        throw new Error('Selecione um empreendimento');
      }

      let assignedBrokerId: string | null = null;

      if (manualAssign) {
        // Manual assignment
        if (!selectedBrokerId) {
          throw new Error('Selecione um corretor para atribuição manual');
        }
        assignedBrokerId = selectedBrokerId;
      } else {
        // Auto assignment - round robin from online brokers
        if (onlineBrokers && onlineBrokers.length > 0) {
          // Get broker with oldest last_assigned_at or first in list
          const { data: queueData } = await supabase
            .from('broker_queue')
            .select('broker_id, last_assigned_at')
            .in('broker_id', onlineBrokers.map(b => b.id))
            .order('last_assigned_at', { ascending: true, nullsFirst: true })
            .limit(1);

          if (queueData && queueData.length > 0) {
            assignedBrokerId = queueData[0].broker_id;
          } else {
            // If no queue entry, pick first online broker
            assignedBrokerId = onlineBrokers[0].id;
          }
        }
      }

      // Create the simulated proposal
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          property_id: formData.property_id,
          client_name: formData.client_name,
          client_cpf: formData.client_cpf,
          client_rg: formData.client_rg,
          client_phone: formData.client_phone,
          client_email: formData.client_email,
          client_marital_status: formData.client_marital_status,
          proposal_type: formData.proposal_type,
          proposal_value: formData.proposal_value,
          proposal_description: formData.proposal_description,
          assigned_broker_id: assignedBrokerId,
          status: assignedBrokerId ? 'pending_acceptance' : 'new',
          assigned_at: assignedBrokerId ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update broker queue if assigned
      if (assignedBrokerId) {
        // Upsert into broker_queue
        await supabase
          .from('broker_queue')
          .upsert({
            broker_id: assignedBrokerId,
            last_assigned_at: new Date().toISOString(),
            queue_position: 999,
          }, { onConflict: 'broker_id' });
      }

      return { proposal, assignedBrokerId };
    },
    onSuccess: ({ assignedBrokerId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      if (assignedBrokerId) {
        toast.success('Proposta simulada criada!', {
          description: 'A proposta foi atribuída a um corretor online.',
        });
      } else {
        toast.warning('Proposta criada sem atribuição', {
          description: 'Nenhum corretor online disponível.',
        });
      }
    },
    onError: (error) => {
      toast.error('Erro ao simular proposta', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate();
  };

  return (
    <Card className="border-0 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Simulador de Propostas
        </CardTitle>
        <CardDescription>
          Crie propostas de teste para verificar o fluxo de distribuição para corretores.
          {onlineBrokers && onlineBrokers.length > 0 ? (
            <span className="block mt-1 text-success">
              {onlineBrokers.length} corretor(es) online: {onlineBrokers.map(b => b.name).join(', ')}
            </span>
          ) : (
            <span className="block mt-1 text-amber-500">
              Nenhum corretor online no momento.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Empreendimento *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingProperties ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : properties?.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum empreendimento</SelectItem>
                  ) : (
                    properties?.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name} - {prop.location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">E-mail</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone">Telefone</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Estado Civil</Label>
              <Select
                value={formData.client_marital_status}
                onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => 
                  setFormData(prev => ({ ...prev, client_marital_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_type">Tipo de Proposta</Label>
              <Select
                value={formData.proposal_type}
                onValueChange={(value: 'cash' | 'financed') => 
                  setFormData(prev => ({ ...prev, proposal_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPOSAL_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_value">Valor da Proposta (R$)</Label>
              <Input
                id="proposal_value"
                type="number"
                value={formData.proposal_value}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_value: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Observações</Label>
            <Textarea
              id="description"
              value={formData.proposal_description}
              onChange={(e) => setFormData(prev => ({ ...prev, proposal_description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Manual Assignment Toggle */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="manual-assign" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Atribuição Manual
                </Label>
                <p className="text-xs text-muted-foreground">
                  Escolha um corretor específico (mesmo offline)
                </p>
              </div>
              <Switch
                id="manual-assign"
                checked={manualAssign}
                onCheckedChange={setManualAssign}
              />
            </div>

            {manualAssign && (
              <div className="space-y-2">
                <Label>Selecione o Corretor</Label>
                <Select
                  value={selectedBrokerId}
                  onValueChange={setSelectedBrokerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um corretor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allBrokers?.map((broker) => (
                      <SelectItem key={broker.id} value={broker.id}>
                        {broker.name} {broker.status === 'online' ? '🟢' : '🔴'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={simulateMutation.isPending || !formData.property_id || (manualAssign && !selectedBrokerId)}
          >
            {simulateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando Proposta...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Simular Proposta
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
