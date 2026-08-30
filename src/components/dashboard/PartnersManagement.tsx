import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  is_active: boolean;
  display_order: number;
}

export function PartnersManagement() {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; logo_url: string }) => {
      const maxOrder = partners?.reduce((max, p) => Math.max(max, p.display_order), 0) || 0;
      const { error } = await supabase.from('partners').insert([{
        ...data,
        display_order: maxOrder + 1
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro adicionado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao adicionar parceiro', { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Partner> }) => {
      const { error } = await supabase.from('partners').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Parceiro removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover', { description: error.message });
    },
  });

  const resetForm = () => {
    setPartnerName('');
    setLogoUrl(null);
    setIsAdding(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `partner-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
      setLogoUrl(data.publicUrl);
      toast.success('Logo enviada!');
    } else {
      toast.error('Erro ao enviar logo');
    }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!partnerName || !logoUrl) {
      toast.error('Nome e logo são obrigatórios');
      return;
    }

    createMutation.mutate({
      name: partnerName,
      logo_url: logoUrl,
    });
  };

  const toggleActive = (partner: Partner) => {
    updateMutation.mutate({
      id: partner.id,
      data: { is_active: !partner.is_active },
    });
  };

  return (
    <Card className="mt-8 border-0 shadow-elegant">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-primary" />
          Parceiros
        </CardTitle>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Parceiro
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Parceiro *</Label>
                <Input
                  placeholder="Nome da empresa"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo *</Label>
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-white p-1">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button variant="outline" size="sm" disabled={uploading}>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Enviar Logo'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                variant="gold" 
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Parceiro
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : partners?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum parceiro cadastrado
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {partners?.map((partner) => (
              <div
                key={partner.id}
                className={`relative group p-4 border rounded-lg bg-white transition-all ${
                  !partner.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="aspect-square flex items-center justify-center p-2 mb-2">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-xs font-medium text-center truncate">{partner.name}</p>
                
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Switch
                    checked={partner.is_active}
                    onCheckedChange={() => toggleActive(partner)}
                    className="scale-75"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Remover este parceiro?')) {
                        deleteMutation.mutate(partner.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
