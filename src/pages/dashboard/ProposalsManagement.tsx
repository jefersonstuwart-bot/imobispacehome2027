import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProposalNotifications } from '@/hooks/useProposalNotifications';
import { 
  Eye, 
  Download, 
  RefreshCw, 
  Loader2, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Bell
} from 'lucide-react';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_TYPE_LABELS, MARITAL_STATUS_LABELS } from '@/lib/constants';

interface Proposal {
  id: string;
  property_id: string;
  assigned_broker_id: string | null;
  client_name: string;
  client_cpf: string;
  client_rg: string;
  client_phone: string;
  client_email: string;
  client_marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  spouse_name: string | null;
  spouse_cpf: string | null;
  spouse_rg: string | null;
  proposal_type: 'cash' | 'financed';
  proposal_value: number;
  proposal_description: string | null;
  status: 'new' | 'pending_acceptance' | 'in_progress' | 'completed' | 'redistributed';
  accepted_at: string | null;
  assigned_at: string;
  redistribution_count: number;
  created_at: string;
  properties?: { name: string; location: string };
  profiles?: { name: string; email: string };
}

type ProposalUpdate = Omit<Proposal, 'id' | 'properties' | 'profiles'>;

interface Document {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  is_spouse_document: boolean;
}

export default function ProposalsManagement() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data: proposals, isLoading, refetch } = useQuery({
    queryKey: ['admin-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          properties:property_id (name, location),
          profiles:assigned_broker_id (name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Proposal[];
    },
  });

  // Use notification hook for realtime updates
  useProposalNotifications({
    onProposalAccepted: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
    },
  });

  const { data: brokers } = useQuery({
    queryKey: ['admin-brokers-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, status, is_active')
        .eq('role', 'broker')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProposalUpdate> }) => {
      const { error } = await supabase.from('proposals').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
      toast.success('Proposta atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar', { description: error.message });
    },
  });

  const fetchDocuments = async (proposalId: string) => {
    setLoadingDocs(true);
    const { data, error } = await supabase
      .from('client_documents')
      .select('*')
      .eq('proposal_id', proposalId);
    
    if (!error && data) {
      setDocuments(data);
    }
    setLoadingDocs(false);
  };

  const handleViewProposal = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    await fetchDocuments(proposal.id);
  };

  const handleReassign = async (proposalId: string, brokerId: string) => {
    await updateMutation.mutateAsync({
      id: proposalId,
      data: {
        assigned_broker_id: brokerId,
        status: 'pending_acceptance',
        assigned_at: new Date().toISOString(),
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      new: 'bg-amber-100 text-amber-700 border-amber-200',
      pending_acceptance: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-success/10 text-success border-success/20',
      redistributed: 'bg-orange-100 text-orange-700 border-orange-200',
    };

    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {PROPOSAL_STATUS_LABELS[status as keyof typeof PROPOSAL_STATUS_LABELS]}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredProposals = proposals?.filter(p => 
    statusFilter === 'all' ? true : p.status === statusFilter
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Propostas
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie todas as propostas recebidas
            </p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(PROPOSAL_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proposals?.filter(p => p.status === 'new').length || 0}</p>
                <p className="text-sm text-muted-foreground">Novas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proposals?.filter(p => p.status === 'pending_acceptance').length || 0}</p>
                <p className="text-sm text-muted-foreground">Aguardando Aceite</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proposals?.filter(p => p.status === 'in_progress').length || 0}</p>
                <p className="text-sm text-muted-foreground">Em Atendimento</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proposals?.filter(p => p.status === 'completed').length || 0}</p>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Lista de Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProposals?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">Nenhuma proposta encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  As propostas enviadas aparecerão aqui
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals?.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{proposal.client_name}</p>
                            <p className="text-xs text-muted-foreground">{proposal.client_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{proposal.properties?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PROPOSAL_TYPE_LABELS[proposal.proposal_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(proposal.proposal_value)}</span>
                      </TableCell>
                      <TableCell>
                        {proposal.profiles?.name || (
                          <span className="text-muted-foreground text-sm">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(proposal.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewProposal(proposal)}
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Proposal Detail Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Detalhes da Proposta
            </DialogTitle>
          </DialogHeader>

          {selectedProposal && (
            <Tabs defaultValue="client" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="client">Cliente</TabsTrigger>
                <TabsTrigger value="proposal">Proposta</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedProposal.client_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{selectedProposal.client_cpf}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="font-medium">{selectedProposal.client_rg}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estado Civil</p>
                    <p className="font-medium">
                      {MARITAL_STATUS_LABELS[selectedProposal.client_marital_status]}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Telefone
                    </p>
                    <p className="font-medium">{selectedProposal.client_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> E-mail
                    </p>
                    <p className="font-medium">{selectedProposal.client_email}</p>
                  </div>
                </div>

                {selectedProposal.spouse_name && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Dados do Cônjuge</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{selectedProposal.spouse_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CPF</p>
                        <p className="font-medium">{selectedProposal.spouse_cpf}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">RG</p>
                        <p className="font-medium">{selectedProposal.spouse_rg}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="proposal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Empreendimento</p>
                    <p className="font-medium">{selectedProposal.properties?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProposal.properties?.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tipo de Proposta</p>
                    <Badge variant="outline" className="mt-1">
                      {PROPOSAL_TYPE_LABELS[selectedProposal.proposal_type]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valor da Proposta</p>
                    <p className="text-2xl font-bold text-secondary">
                      {formatCurrency(selectedProposal.proposal_value)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedProposal.status)}</div>
                  </div>
                </div>

                {selectedProposal.proposal_description && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descrição da Proposta</p>
                    <p className="p-3 bg-muted rounded-lg text-sm">
                      {selectedProposal.proposal_description}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Atribuir/Redistribuir Corretor</h4>
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedProposal.assigned_broker_id || ''}
                      onValueChange={(value) => handleReassign(selectedProposal.id, value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Selecionar corretor" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers?.map((broker) => (
                          <SelectItem key={broker.id} value={broker.id}>
                            <div className="flex items-center gap-2">
                              <span>{broker.name}</span>
                              {broker.status === 'online' && (
                                <Badge variant="outline" className="text-xs border-success text-success">
                                  Online
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProposal.redistribution_count > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Redistribuída {selectedProposal.redistribution_count}x
                      </span>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                {loadingDocs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum documento encontrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.filter(d => !d.is_spouse_document).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Documentos do Cliente</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {documents
                            .filter(d => !d.is_spouse_document)
                            .map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                              >
                                <FileText className="w-4 h-4 text-secondary" />
                                <span className="text-sm truncate flex-1">{doc.file_name}</span>
                                <Download className="w-4 h-4 text-muted-foreground" />
                              </a>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {documents.filter(d => d.is_spouse_document).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Documentos do Cônjuge</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {documents
                            .filter(d => d.is_spouse_document)
                            .map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                              >
                                <FileText className="w-4 h-4 text-secondary" />
                                <span className="text-sm truncate flex-1">{doc.file_name}</span>
                                <Download className="w-4 h-4 text-muted-foreground" />
                              </a>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
