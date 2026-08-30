import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Sparkles, Loader2, MapPin, Image, FileText, Eye, Building2, DollarSign, Ruler, Upload, Download } from 'lucide-react';
import { PartnersManagement } from '@/components/dashboard/PartnersManagement';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string | null;
  ai_description: string | null;
  images: string[];
  pdf_url: string | null;
  pdf_cover_image: string | null;
  is_active: boolean;
  is_mcmv: boolean;
  mcmv_logo_url: string | null;
  min_income: number | null;
  created_at: string;
}

interface PropertyPrice {
  id: string;
  property_id: string;
  unit_type: string;
  area_m2: number;
  bedrooms: number | null;
  suites: number | null;
  parking_spots: number | null;
  price: number;
  floor: string | null;
  status: string | null;
}

export default function PropertiesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    ai_description: '',
    min_income: '',
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfCoverImage, setPdfCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isMcmv, setIsMcmv] = useState(false);
  const [mcmvLogoUrl, setMcmvLogoUrl] = useState<string | null>(null);
  const [uploadingMcmvLogo, setUploadingMcmvLogo] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Preços
  const [pricesDialogOpen, setPricesDialogOpen] = useState(false);
  const [selectedPropertyForPrices, setSelectedPropertyForPrices] = useState<Property | null>(null);
  const [priceForm, setPriceForm] = useState({
    unit_type: '',
    area_m2: '',
    bedrooms: '',
    suites: '',
    parking_spots: '',
    price: '',
    floor: '',
    status: 'available',
  });
  const [editingPrice, setEditingPrice] = useState<PropertyPrice | null>(null);
  const [uploadingPriceTable, setUploadingPriceTable] = useState(false);
  const [uploadingPricePdf, setUploadingPricePdf] = useState(false);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const { data: prices, refetch: refetchPrices } = useQuery({
    queryKey: ['property-prices', editingProperty?.id || selectedPropertyForPrices?.id],
    queryFn: async () => {
      const propertyId = editingProperty?.id || selectedPropertyForPrices?.id;
      if (!propertyId) return [];
      const { data, error } = await supabase
        .from('property_prices')
        .select('*')
        .eq('property_id', propertyId)
        .order('price', { ascending: true });
      if (error) throw error;
      return data as PropertyPrice[];
    },
    enabled: !!(editingProperty?.id || selectedPropertyForPrices?.id),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; location: string; description?: string | null; ai_description?: string | null; images?: string[]; pdf_url?: string | null; pdf_cover_image?: string | null; is_mcmv?: boolean; mcmv_logo_url?: string | null; min_income?: number | null }) => {
      const { error } = await supabase.from('properties').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento criado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar empreendimento', { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      const { error } = await supabase.from('properties').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento atualizado!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Empreendimento excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir', { description: error.message });
    },
  });

  const createPriceMutation = useMutation({
    mutationFn: async (data: Omit<PropertyPrice, 'id'>) => {
      const { error } = await supabase.from('property_prices').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPrices();
      toast.success('Preço adicionado!');
      resetPriceForm();
    },
    onError: (error) => {
      toast.error('Erro ao adicionar preço', { description: error.message });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PropertyPrice> }) => {
      const { error } = await supabase.from('property_prices').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPrices();
      toast.success('Preço atualizado!');
      resetPriceForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar preço', { description: error.message });
    },
  });

  const deletePriceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('property_prices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPrices();
      toast.success('Preço removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover preço', { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', location: '', description: '', ai_description: '', min_income: '' });
    setUploadedImages([]);
    setPdfUrl(null);
    setPdfCoverImage(null);
    setIsMcmv(false);
    setMcmvLogoUrl(null);
    setEditingProperty(null);
    setIsDialogOpen(false);
  };

  const resetPriceForm = () => {
    setPriceForm({
      unit_type: '',
      area_m2: '',
      bedrooms: '',
      suites: '',
      parking_spots: '',
      price: '',
      floor: '',
      status: 'available',
    });
    setEditingPrice(null);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      description: property.description || '',
      ai_description: property.ai_description || '',
      min_income: property.min_income?.toString() || '',
    });
    setUploadedImages(property.images || []);
    setPdfUrl(property.pdf_url);
    setPdfCoverImage(property.pdf_cover_image);
    setIsMcmv(property.is_mcmv || false);
    setMcmvLogoUrl(property.mcmv_logo_url);
    setIsDialogOpen(true);
  };

  const handleEditPrice = (price: PropertyPrice) => {
    setEditingPrice(price);
    setPriceForm({
      unit_type: price.unit_type,
      area_m2: price.area_m2.toString(),
      bedrooms: price.bedrooms?.toString() || '',
      suites: price.suites?.toString() || '',
      parking_spots: price.parking_spots?.toString() || '',
      price: price.price.toString(),
      floor: price.floor || '',
      status: price.status || 'available',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        newImages.push(data.publicUrl);
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploadingImages(false);
    toast.success(`${newImages.length} imagem(ns) enviada(s)!`);
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const fileName = `cover-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
      setPdfCoverImage(data.publicUrl);
      toast.success('Imagem de capa enviada!');
    } else {
      toast.error('Erro ao enviar imagem de capa');
    }
    setUploadingCover(false);
  };

  const handleMcmvLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMcmvLogo(true);
    const fileName = `mcmv-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
      setMcmvLogoUrl(data.publicUrl);
      toast.success('Logo Minha Casa Minha Vida enviada!');
    } else {
      toast.error('Erro ao enviar logo');
    }
    setUploadingMcmvLogo(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from('property-documents')
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('property-documents').getPublicUrl(fileName);
      setPdfUrl(data.publicUrl);
      toast.success('PDF enviado! Extraindo imagem de capa...');
      
      // Extrair capa automaticamente
      try {
        const { data: coverData, error: coverError } = await supabase.functions.invoke('extract-pdf-cover', {
          body: { pdfUrl: data.publicUrl }
        });
        
        if (!coverError && coverData?.coverImage) {
          setPdfCoverImage(coverData.coverImage);
          toast.success('Imagem de capa extraída automaticamente!');
        } else {
          console.log('Cover extraction returned no image:', coverData);
          toast.info('Não foi possível extrair capa automática. Você pode enviar uma manualmente.');
        }
      } catch (coverErr) {
        console.error('Error extracting cover:', coverErr);
        toast.info('Não foi possível extrair capa. Envie uma imagem manualmente.');
      }
    } else {
      toast.error('Erro ao enviar PDF');
    }
    setUploadingPdf(false);
  };

  const generateAIDescription = async () => {
    if (!formData.name || !formData.location) {
      toast.error('Preencha o nome e localização primeiro');
      return;
    }

    setGeneratingAI(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: {
          name: formData.name,
          location: formData.location,
          description: formData.description,
          pdfUrl: pdfUrl,
          images: uploadedImages,
        },
      });

      if (error) throw error;

      setFormData(prev => ({ ...prev, ai_description: data.description }));
      toast.success('Descrição gerada com IA!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Erro ao gerar descrição com IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location) {
      toast.error('Nome e localização são obrigatórios');
      return;
    }

    const propertyData = {
      name: formData.name,
      location: formData.location,
      description: formData.description || null,
      ai_description: formData.ai_description || null,
      images: uploadedImages,
      pdf_url: pdfUrl,
      pdf_cover_image: pdfCoverImage,
      is_mcmv: isMcmv,
      mcmv_logo_url: isMcmv ? mcmvLogoUrl : null,
      min_income: formData.min_income ? parseBrazilianNumber(formData.min_income) : null,
    };

    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data: propertyData });
    } else {
      createMutation.mutate(propertyData);
    }
  };

  const handlePriceSubmit = () => {
    const propertyId = selectedPropertyForPrices?.id || editingProperty?.id;
    if (!propertyId || !priceForm.unit_type || !priceForm.area_m2 || !priceForm.price) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const priceData = {
      property_id: propertyId,
      unit_type: priceForm.unit_type,
      area_m2: parseBrazilianNumber(priceForm.area_m2),
      bedrooms: priceForm.bedrooms ? parseInt(priceForm.bedrooms) : null,
      suites: priceForm.suites ? parseInt(priceForm.suites) : null,
      parking_spots: priceForm.parking_spots ? parseInt(priceForm.parking_spots) : null,
      price: parseBrazilianNumber(priceForm.price),
      floor: priceForm.floor || null,
      status: priceForm.status,
    };

    if (editingPrice) {
      updatePriceMutation.mutate({ id: editingPrice.id, data: priceData });
    } else {
      createPriceMutation.mutate(priceData);
    }
  };

  const toggleActive = async (property: Property) => {
    await updateMutation.mutateAsync({
      id: property.id,
      data: { is_active: !property.is_active },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Parse Brazilian currency format (261.800,00 -> 261800.00)
  const parseBrazilianNumber = (value: string): number => {
    if (!value) return 0;
    // Remove dots (thousands separator) and replace comma with dot (decimal separator)
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const openPricesDialog = (property: Property) => {
    setSelectedPropertyForPrices(property);
    setPricesDialogOpen(true);
    resetPriceForm();
  };

  const handlePriceTableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const propertyId = selectedPropertyForPrices?.id || editingProperty?.id;
    if (!file || !propertyId) return;

    setUploadingPriceTable(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Pula o cabeçalho se existir
      const dataLines = lines[0].toLowerCase().includes('tipo') || lines[0].toLowerCase().includes('unidade') 
        ? lines.slice(1) 
        : lines;

      let imported = 0;
      
      for (const line of dataLines) {
        // Suporta CSV com ; ou ,
        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator).map(c => c.trim().replace(/"/g, ''));
        
        if (cols.length < 3) continue;

        // Formato esperado: Tipo/Unidade, Área, Quartos, Suítes, Vagas, Andar, Preço, Status
        const priceData = {
          property_id: propertyId,
          unit_type: cols[0] || 'Unidade',
          area_m2: parseFloat(cols[1]?.replace(',', '.')) || 0,
          bedrooms: cols[2] ? parseInt(cols[2]) : null,
          suites: cols[3] ? parseInt(cols[3]) : null,
          parking_spots: cols[4] ? parseInt(cols[4]) : null,
          floor: cols[5] || null,
          price: parseFloat(cols[6]?.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
          status: cols[7]?.toLowerCase() === 'vendido' ? 'sold' 
            : cols[7]?.toLowerCase() === 'reservado' ? 'reserved' 
            : 'available',
        };

        if (priceData.area_m2 > 0 && priceData.price > 0) {
          const { error } = await supabase.from('property_prices').insert([priceData]);
          if (!error) imported++;
        }
      }

      if (imported > 0) {
        toast.success(`${imported} unidade(s) importada(s) com sucesso!`);
        refetchPrices();
      } else {
        toast.error('Nenhuma unidade válida encontrada no arquivo');
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Erro ao processar arquivo. Verifique o formato.');
    } finally {
      setUploadingPriceTable(false);
      e.target.value = '';
    }
  };

  const handlePricePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const propertyId = selectedPropertyForPrices?.id || editingProperty?.id;
    if (!file || !propertyId) return;

    setUploadingPricePdf(true);

    try {
      // Upload do PDF
      const fileName = `prices-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('property-documents')
        .getPublicUrl(fileName);

      toast.info('PDF enviado. Extraindo preços com IA...');

      // Chamar edge function para extrair preços
      const { data, error } = await supabase.functions.invoke('extract-pdf-prices', {
        body: { pdfUrl: urlData.publicUrl }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (!data?.prices || data.prices.length === 0) {
        toast.error('Nenhum preço encontrado no PDF');
        return;
      }

      // Inserir os preços extraídos
      let imported = 0;
      for (const price of data.prices) {
        const priceData = {
          property_id: propertyId,
          unit_type: price.unit_type || 'Unidade',
          area_m2: parseFloat(price.area_m2) || 0,
          bedrooms: price.bedrooms ? parseInt(price.bedrooms) : null,
          suites: price.suites ? parseInt(price.suites) : null,
          parking_spots: price.parking_spots ? parseInt(price.parking_spots) : null,
          floor: price.floor || null,
          price: parseFloat(price.price) || 0,
          status: price.status || 'available',
        };

        if (priceData.area_m2 > 0 && priceData.price > 0) {
          const { error: insertError } = await supabase.from('property_prices').insert([priceData]);
          if (!insertError) imported++;
        }
      }

      if (imported > 0) {
        toast.success(`${imported} unidade(s) extraída(s) do PDF com sucesso!`);
        refetchPrices();
      } else {
        toast.error('Não foi possível importar os preços do PDF');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Erro ao processar PDF. Tente novamente.');
    } finally {
      setUploadingPricePdf(false);
      e.target.value = '';
    }
  };

  const downloadTemplateCSV = () => {
    const template = `Unidade;Área (m²);Quartos;Suítes;Vagas;Andar;Preço;Status
Apto 101;65.5;2;1;1;1º;350000;Disponível
Apto 102;72.3;3;1;2;1º;420000;Disponível
Apto 201;65.5;2;1;1;2º;365000;Reservado`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_tabela_precos.csv';
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Empreendimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os imóveis cadastrados na plataforma
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Empreendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingProperty ? 'Editar Empreendimento' : 'Novo Empreendimento'}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="prices" disabled={!editingProperty}>Preços</TabsTrigger>
                  <TabsTrigger value="ai">IA & Planta</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Empreendimento *</Label>
                      <Input
                        placeholder="Ex: Residencial Vista Mar"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Localização *</Label>
                      <Input
                        placeholder="Ex: Praia Grande, SP"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição Base</Label>
                    <Textarea
                      placeholder="Descrição básica do empreendimento (usado como base para IA)"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Renda Mínima Necessária</Label>
                    <Input
                      placeholder="Ex: 5.100,00"
                      value={formData.min_income}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_income: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Renda mínima para financiamento (será exibida no card do empreendimento)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Imagens do Empreendimento</Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingImages}
                        />
                        <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                          {uploadingImages ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Image className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Clique para enviar imagens
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {uploadedImages.map((img, i) => (
                            <div key={i} className="relative group">
                              <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PDF do Material</Label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingPdf}
                          />
                          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                            {uploadingPdf ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : pdfUrl ? (
                              <>
                                <FileText className="w-5 h-5 text-success" />
                                <span className="text-sm text-success">PDF enviado</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Enviar PDF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Imagem de Capa do PDF</Label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingCover}
                          />
                          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                            {uploadingCover ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : pdfCoverImage ? (
                              <img src={pdfCoverImage} alt="Capa" className="w-full h-20 object-cover rounded" />
                            ) : (
                              <>
                                <Image className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Capa do PDF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Esta imagem será exibida como miniatura do PDF para clientes
                        </p>
                      </div>
                    </div>

                    {/* Minha Casa Minha Vida */}
                    <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-semibold">Minha Casa Minha Vida</Label>
                          <p className="text-xs text-muted-foreground">
                            Marque se este empreendimento faz parte do programa
                          </p>
                        </div>
                        <Switch
                          checked={isMcmv}
                          onCheckedChange={setIsMcmv}
                        />
                      </div>

                      {isMcmv && (
                        <div className="space-y-2">
                          <Label>Logo do Programa</Label>
                          <div className="flex items-center gap-4">
                            {mcmvLogoUrl ? (
                              <div className="relative group">
                                <img 
                                  src={mcmvLogoUrl} 
                                  alt="Logo MCMV" 
                                  className="h-16 w-auto object-contain bg-white rounded-lg p-2 border"
                                />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => setMcmvLogoUrl(null)}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleMcmvLogoUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingMcmvLogo}
                                />
                                <Button variant="outline" size="sm" disabled={uploadingMcmvLogo}>
                                  {uploadingMcmvLogo ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Image className="w-4 h-4 mr-2" />
                                  )}
                                  Enviar Logo MCMV
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Esta logo será exibida ao lado do empreendimento para os clientes
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4 py-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>💡 Dica:</strong> A IA irá analisar o PDF do empreendimento (se enviado) para extrair automaticamente informações de planta, metragem e especificações técnicas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Descrição Persuasiva (IA)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIDescription}
                        disabled={generatingAI}
                      >
                        {generatingAI ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Gerar com IA
                      </Button>
                    </div>
                    <Textarea
                      placeholder="A descrição será gerada automaticamente pela IA..."
                      rows={6}
                      value={formData.ai_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, ai_description: e.target.value }))}
                    />
                  </div>
                </TabsContent>

                {/* Aba de Preços - só disponível ao editar */}
                <TabsContent value="prices" className="space-y-4 py-4">
                  {editingProperty ? (
                    <div className="space-y-4">
                      {/* Upload de tabela */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Upload CSV */}
                        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Importar via CSV
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Envie uma planilha CSV com os dados
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={downloadTemplateCSV}
                                  className="text-xs flex-1"
                                >
                                  <Download className="w-3.5 h-3.5 mr-1" />
                                  Modelo
                                </Button>
                                <div className="relative flex-1">
                                  <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={(e) => {
                                      if (editingProperty) {
                                        setSelectedPropertyForPrices(editingProperty);
                                        handlePriceTableUpload(e);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploadingPriceTable}
                                  />
                                  <Button variant="gold" size="sm" className="w-full" disabled={uploadingPriceTable}>
                                    {uploadingPriceTable ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    CSV
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Upload PDF */}
                        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  Importar via PDF (IA)
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Envie um PDF e a IA extrairá os preços
                                </p>
                              </div>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => {
                                    if (editingProperty) {
                                      setSelectedPropertyForPrices(editingProperty);
                                      handlePricePdfUpload(e);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingPricePdf}
                                />
                                <Button variant="gold" size="sm" className="w-full" disabled={uploadingPricePdf}>
                                  {uploadingPricePdf ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Processando...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Enviar PDF
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Formulário manual */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">
                            {editingPrice ? 'Editar Unidade' : 'Adicionar Manualmente'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo de Unidade *</Label>
                              <Input
                                placeholder="Ex: Apto 101"
                                value={priceForm.unit_type}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, unit_type: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Área (m²) *</Label>
                              <Input
                                type="number"
                                placeholder="65"
                                value={priceForm.area_m2}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, area_m2: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Quartos</Label>
                              <Input
                                type="number"
                                placeholder="2"
                                value={priceForm.bedrooms}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Suítes</Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={priceForm.suites}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, suites: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Vagas</Label>
                              <Input
                                type="number"
                                placeholder="2"
                                value={priceForm.parking_spots}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, parking_spots: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Andar</Label>
                              <Input
                                placeholder="10º"
                                value={priceForm.floor}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, floor: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Preço (R$) *</Label>
                              <Input
                                type="text"
                                placeholder="261.800,00"
                                value={priceForm.price}
                                onChange={(e) => setPriceForm(prev => ({ ...prev, price: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Status</Label>
                              <Select
                                value={priceForm.status}
                                onValueChange={(value) => setPriceForm(prev => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Disponível</SelectItem>
                                  <SelectItem value="reserved">Reservado</SelectItem>
                                  <SelectItem value="sold">Vendido</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            {editingPrice && (
                              <Button variant="outline" size="sm" onClick={resetPriceForm}>
                                Cancelar
                              </Button>
                            )}
                            <Button
                              variant="gold"
                              size="sm"
                              onClick={() => {
                                if (editingProperty) {
                                  setSelectedPropertyForPrices(editingProperty);
                                  handlePriceSubmit();
                                }
                              }}
                              disabled={createPriceMutation.isPending || updatePriceMutation.isPending}
                            >
                              {(createPriceMutation.isPending || updatePriceMutation.isPending) && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              )}
                              {editingPrice ? 'Atualizar' : 'Adicionar'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tabela de preços */}
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Unidade</TableHead>
                              <TableHead>Área</TableHead>
                              <TableHead>Quartos</TableHead>
                              <TableHead>Vagas</TableHead>
                              <TableHead>Preço</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-20">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prices?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                  Nenhum preço cadastrado
                                </TableCell>
                              </TableRow>
                            ) : (
                              prices?.map((price) => (
                                <TableRow key={price.id}>
                                  <TableCell className="font-medium">{price.unit_type}</TableCell>
                                  <TableCell>{price.area_m2}m²</TableCell>
                                  <TableCell>{price.bedrooms || '-'}</TableCell>
                                  <TableCell>{price.parking_spots || '-'}</TableCell>
                                  <TableCell className="font-semibold text-primary">
                                    {formatCurrency(Number(price.price))}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={price.status === 'available' ? 'default' : price.status === 'reserved' ? 'secondary' : 'destructive'}
                                    >
                                      {price.status === 'available' ? 'Disponível' : price.status === 'reserved' ? 'Reservado' : 'Vendido'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditPrice(price)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          if (confirm('Remover este preço?')) {
                                            deletePriceMutation.mutate(price.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Salve o empreendimento primeiro para adicionar preços</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  variant="gold"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingProperty ? 'Salvar Alterações' : 'Criar Empreendimento'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog de Preços */}
        <Dialog open={pricesDialogOpen} onOpenChange={setPricesDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Tabela de Preços - {selectedPropertyForPrices?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Upload de tabela */}
              <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        Importar Tabela de Preços
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Envie um arquivo CSV com os dados das unidades
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplateCSV}
                        className="text-xs"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Baixar Modelo
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handlePriceTableUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingPriceTable}
                        />
                        <Button variant="gold" size="sm" disabled={uploadingPriceTable}>
                          {uploadingPriceTable ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Enviar CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário de adição/edição */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {editingPrice ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo de Unidade *</Label>
                      <Input
                        placeholder="Ex: Apto 101"
                        value={priceForm.unit_type}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, unit_type: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Área (m²) *</Label>
                      <Input
                        type="number"
                        placeholder="65"
                        value={priceForm.area_m2}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, area_m2: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quartos</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={priceForm.bedrooms}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Suítes</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={priceForm.suites}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, suites: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Vagas</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={priceForm.parking_spots}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, parking_spots: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Andar</Label>
                      <Input
                        placeholder="10º"
                        value={priceForm.floor}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, floor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço (R$) *</Label>
                      <Input
                        type="text"
                        placeholder="261.800,00"
                        value={priceForm.price}
                        onChange={(e) => setPriceForm(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={priceForm.status}
                        onValueChange={(value) => setPriceForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="reserved">Reservado</SelectItem>
                          <SelectItem value="sold">Vendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    {editingPrice && (
                      <Button variant="outline" size="sm" onClick={resetPriceForm}>
                        Cancelar
                      </Button>
                    )}
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handlePriceSubmit}
                      disabled={createPriceMutation.isPending || updatePriceMutation.isPending}
                    >
                      {(createPriceMutation.isPending || updatePriceMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingPrice ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de preços */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Quartos</TableHead>
                      <TableHead>Suítes</TableHead>
                      <TableHead>Vagas</TableHead>
                      <TableHead>Andar</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum preço cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      prices?.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.unit_type}</TableCell>
                          <TableCell>{price.area_m2}m²</TableCell>
                          <TableCell>{price.bedrooms || '-'}</TableCell>
                          <TableCell>{price.suites || '-'}</TableCell>
                          <TableCell>{price.parking_spots || '-'}</TableCell>
                          <TableCell>{price.floor || '-'}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatCurrency(price.price)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={price.status === 'available' ? 'default' : price.status === 'reserved' ? 'secondary' : 'destructive'}
                            >
                              {price.status === 'available' ? 'Disponível' : price.status === 'reserved' ? 'Reservado' : 'Vendido'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditPrice(price)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm('Remover este preço?')) {
                                    deletePriceMutation.mutate(price.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : properties?.length === 0 ? (
          <Card className="border-0 shadow-elegant">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">Nenhum empreendimento</h3>
              <p className="text-muted-foreground text-sm">
                Clique em "Novo Empreendimento" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <Card key={property.id} className="border-0 shadow-elegant overflow-hidden group">
                <div className="relative h-40 bg-muted">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badge MCMV */}
                  {property.is_mcmv && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg flex items-center gap-1">
                      🏠 MCMV
                    </div>
                  )}
                  
                  <Badge
                    className={`absolute top-2 right-2 ${
                      property.is_active
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {property.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.location}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={property.is_active}
                        onCheckedChange={() => toggleActive(property)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {property.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openPricesDialog(property)}
                        title="Tabela de Preços"
                      >
                        <DollarSign className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`/empreendimento/${property.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(property)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir?')) {
                            deleteMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Partners Section */}
        <PartnersManagement />
      </div>
    </DashboardLayout>
  );
}