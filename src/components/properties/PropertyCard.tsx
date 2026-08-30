import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, FileText, ArrowRight, Eye, Maximize2, BedDouble, Bath, Car } from 'lucide-react';

interface PriceStats {
  minArea: number;
  maxArea: number;
  minPrice: number;
  pricePerM2: number;
  bedrooms: number | null;
  suites: number | null;
  parkingSpots: number | null;
}

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    images: string[] | null;
    ai_description: string | null;
    pdf_url: string | null;
    pdf_cover_image: string | null;
    is_mcmv?: boolean;
    mcmv_logo_url?: string | null;
    min_income?: number | null;
    priceStats?: PriceStats | null;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Prioriza: imagem do array > imagem de capa do PDF > placeholder
  const mainImage = property.images?.[0] || property.pdf_cover_image || '/placeholder.svg';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatArea = (min: number, max: number) => {
    if (min === max) return `${min.toFixed(1)}`;
    return `${min.toFixed(1)} a ${max.toFixed(1)}`;
  };

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-luxury hover:shadow-gold transition-all duration-700 hover:-translate-y-3">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay gradiente de luxo */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent opacity-80" />
        
        {/* Borda dourada sutil ao hover */}
        <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-t-lg" />

        {/* Badge MCMV */}
        {property.is_mcmv && property.mcmv_logo_url && (
          <div className="absolute top-4 left-4 bg-white rounded-lg p-1.5 shadow-lg">
            <img 
              src={property.mcmv_logo_url} 
              alt="Minha Casa Minha Vida" 
              className="h-8 w-auto object-contain"
            />
          </div>
        )}

        {/* Badge PDF */}
        {property.pdf_url && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-primary/20">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-navy-800">Material Disponível</span>
          </div>
        )}

        {/* Conteúdo sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-medium mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {property.location}
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
            {property.name}
          </h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-4 bg-gradient-to-b from-card to-muted/30">
        {/* Características */}
        {property.priceStats ? (
          <div className="space-y-4">
            {/* Grid de características */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <Maximize2 className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Área</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatArea(property.priceStats.minArea, property.priceStats.maxArea)}
                </p>
                <p className="text-[10px] text-muted-foreground">m²</p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <BedDouble className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Quartos</p>
                <p className="text-sm font-semibold text-foreground">
                  {property.priceStats.bedrooms ?? '-'}
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <Bath className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Suítes</p>
                <p className="text-sm font-semibold text-foreground">
                  {property.priceStats.suites ?? '-'}
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <Car className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Vagas</p>
                <p className="text-sm font-semibold text-foreground">
                  {property.priceStats.parkingSpots ?? '-'}
                </p>
              </div>
            </div>

            {/* Preço e Renda */}
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">A partir de</p>
                <p className="text-xl font-display font-bold text-primary">
                  {formatCurrency(property.priceStats.minPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({formatCurrency(property.priceStats.pricePerM2)}/m²)
                </p>
              </div>

              {property.min_income && (
                <div className="p-2 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">Renda mínima necessária</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(property.min_income)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-light">
            {property.ai_description?.slice(0, 100) + '...' || 'Detalhes em breve...'}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Link to={`/empreendimento/${property.id}`} className="flex-1">
            <Button variant="gold" className="w-full group/btn tracking-wide">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
