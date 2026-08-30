import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, FileText, ChevronLeft, ChevronRight, X, Download, Send, DollarSign, Ruler, Home, Car } from 'lucide-react';

interface PropertyPrice {
  id: string;
  unit_type: string;
  area_m2: number;
  bedrooms: number | null;
  suites: number | null;
  parking_spots: number | null;
  price: number;
  floor: string | null;
  status: string | null;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: prices } = useQuery({
    queryKey: ['property-prices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_prices')
        .select('*')
        .eq('property_id', id)
        .eq('status', 'available')
        .order('price', { ascending: true });

      if (error) throw error;
      return data as PropertyPrice[];
    },
    enabled: !!id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Empreendimento não encontrado</h1>
          <Link to="/">
            <Button>Voltar para Início</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const lowestPrice = prices && prices.length > 0 ? Math.min(...prices.map(p => p.price)) : null;

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar aos Empreendimentos
          </Link>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="details" className="gap-2">
              <Home className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="prices" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Tabela de Preços
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gallery */}
              <div className="space-y-4">
                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group">
                      <img
                        src={hasImages ? images[currentImageIndex] : '/placeholder.svg'}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                          Clique para ampliar
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-black/95">
                    <button
                      onClick={() => setLightboxOpen(false)}
                      className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <img
                      src={images[currentImageIndex]}
                      alt={property.name}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  </DialogContent>
                </Dialog>

                {/* Thumbnails */}
                {hasImages && images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-secondary shadow-gold'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation arrows for multiple images */}
                {hasImages && images.length > 1 && (
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="icon" onClick={prevImage}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextImage}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <Badge className="mb-2 bg-secondary/10 text-secondary border-0">
                    Disponível
                  </Badge>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {property.name}
                  </h1>
                  <p className="flex items-center gap-2 text-lg text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    {property.location}
                  </p>
                  
                  {lowestPrice && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-card border border-primary/20">
                      <p className="text-sm text-muted-foreground">A partir de</p>
                      <p className="font-display text-3xl font-bold text-primary">
                        {formatCurrency(lowestPrice)}
                      </p>
                    </div>
                  )}
                </div>

                {property.ai_description && (
                  <Card className="border-0 shadow-elegant bg-gradient-card">
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="text-gradient">✨ Descrição</span>
                      </h3>
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                        {property.ai_description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {property.pdf_url && (
                  <Card className="border-0 shadow-elegant overflow-hidden group cursor-pointer hover:shadow-gold transition-all">
                    <a href={property.pdf_url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative">
                        {property.pdf_cover_image ? (
                          <img
                            src={property.pdf_cover_image}
                            alt="Material do Empreendimento"
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <FileText className="w-16 h-16 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Material Completo do Empreendimento
                          </p>
                          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                            <Download className="w-4 h-4" />
                            Clique para visualizar o PDF
                          </p>
                        </div>
                      </div>
                    </a>
                  </Card>
                )}

                <Link to={`/proposta/${property.id}`}>
                  <Button variant="hero" size="xl" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Proposta
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prices">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Tabela de Preços - {property.name}
                </CardTitle>
                <p className="text-muted-foreground">
                  Confira as unidades disponíveis e seus valores
                </p>
              </CardHeader>
              <CardContent>
                {prices && prices.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Unidade</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1">
                              <Ruler className="w-4 h-4" />
                              Área
                            </div>
                          </TableHead>
                          <TableHead>Quartos</TableHead>
                          <TableHead>Suítes</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              Vagas
                            </div>
                          </TableHead>
                          <TableHead>Andar</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prices.map((price) => (
                          <TableRow key={price.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{price.unit_type}</TableCell>
                            <TableCell>{price.area_m2}m²</TableCell>
                            <TableCell>{price.bedrooms || '-'}</TableCell>
                            <TableCell>{price.suites || '-'}</TableCell>
                            <TableCell>{price.parking_spots || '-'}</TableCell>
                            <TableCell>{price.floor || '-'}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-display font-bold text-lg text-primary">
                                {formatCurrency(price.price)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Tabela de preços em breve</h3>
                    <p className="text-muted-foreground">
                      Entre em contato para mais informações sobre valores
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <Link to={`/proposta/${property.id}`}>
                    <Button variant="hero" size="xl" className="w-full">
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Proposta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}