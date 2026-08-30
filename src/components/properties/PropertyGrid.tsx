import { PropertyCard } from './PropertyCard';
import { Building2 } from 'lucide-react';

interface PriceStats {
  minArea: number;
  maxArea: number;
  minPrice: number;
  pricePerM2: number;
  bedrooms: number | null;
  suites: number | null;
  parkingSpots: number | null;
}

interface Property {
  id: string;
  name: string;
  location: string;
  images: string[] | null;
  ai_description: string | null;
  pdf_url: string | null;
  pdf_cover_image: string | null;
  is_mcmv?: boolean;
  mcmv_logo_url?: string | null;
  priceStats?: PriceStats | null;
}

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
}

export function PropertyGrid({ properties, loading }: PropertyGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Nenhum empreendimento disponível
        </h3>
        <p className="text-muted-foreground max-w-md">
          Em breve teremos novos empreendimentos para você. Volte em breve!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}
