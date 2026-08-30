import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Users, Phone, Mail, Circle, FileText } from 'lucide-react';

interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'online' | 'offline';
  is_active: boolean;
  proposals_count: number;
  last_seen_at: string | null;
  created_at: string;
}

export default function BrokersManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: brokers, isLoading } = useQuery({
    queryKey: ['admin-brokers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'broker')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Broker[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Broker> }) => {
      const { error } = await supabase.from('profiles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokers'] });
      toast.success('Corretor atualizado!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar', { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setEditingBroker(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setFormData({
      name: broker.name,
      email: broker.email,
      phone: broker.phone || '',
      password: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingBroker) {
        // Update existing broker
        await updateMutation.mutateAsync({
          id: editingBroker.id,
          data: {
            name: formData.name,
            phone: formData.phone || null,
          },
        });
      } else {
        // Create new broker via signup
        if (!formData.password || formData.password.length < 6) {
          toast.error('Senha deve ter pelo menos 6 caracteres');
          setIsSubmitting(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: 'broker',
            },
          },
        });

        if (error) throw error;

        // Update phone number after creation
        if (formData.phone) {
          // Phone will be updated when we can get the new user id
        }

        queryClient.invalidateQueries({ queryKey: ['admin-brokers'] });
        toast.success('Corretor criado com sucesso!');
        resetForm();
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao processar', { description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (broker: Broker) => {
    await updateMutation.mutateAsync({
      id: broker.id,
      data: { is_active: !broker.is_active },
    });
  };

  const formatLastSeen = (date: string | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Corretores
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a equipe de corretores da plataforma
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Corretor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingBroker ? 'Editar Corretor' : 'Novo Corretor'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Nome do corretor"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!!editingBroker}
                  />
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                {!editingBroker && (
                  <div className="space-y-2">
                    <Label>Senha *</Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBroker ? 'Salvar Alterações' : 'Criar Corretor'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{brokers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Corretores</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Circle className="w-6 h-6 text-success fill-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {brokers?.filter(b => b.status === 'online' && b.is_active).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Online Agora</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {brokers?.reduce((acc, b) => acc + (b.proposals_count || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Propostas Atribuídas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brokers Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Lista de Corretores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : brokers?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">Nenhum corretor cadastrado</h3>
                <p className="text-muted-foreground text-sm">
                  Clique em "Novo Corretor" para adicionar
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Propostas</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokers?.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {broker.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{broker.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            {broker.email}
                          </p>
                          {broker.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              {broker.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            broker.status === 'online' && broker.is_active
                              ? 'border-success text-success bg-success/10'
                              : 'border-muted-foreground text-muted-foreground'
                          }`}
                        >
                          <Circle className={`w-2 h-2 mr-1.5 ${
                            broker.status === 'online' && broker.is_active ? 'fill-success' : 'fill-muted-foreground'
                          }`} />
                          {broker.status === 'online' && broker.is_active ? 'Online' : 'Offline'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{broker.proposals_count || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatLastSeen(broker.last_seen_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={broker.is_active}
                          onCheckedChange={() => toggleActive(broker)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(broker)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
