import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Handshake } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
}

export function PartnersSection() {
  const { data: partners } = useQuery({
    queryKey: ['public-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });

  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Handshake className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              Nossos Parceiros
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Empresas que confiam em nossa expertise
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="group flex items-center justify-center p-4 hover:scale-105 transition-all duration-300"
            >
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="max-h-14 md:max-h-20 w-auto object-contain"
                title={partner.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
