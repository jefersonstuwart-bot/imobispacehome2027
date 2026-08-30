import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SETTINGS_KEY = 'imobispace_hero_background';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=90';

export function HeroSection() {
  const [background, setBackground] = useState<{ type: 'image' | 'video'; url: string }>({ type: 'image', url: DEFAULT_IMAGE });

  useEffect(() => {
    let active = true;
    supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle().then(({ data }) => {
      if (!active || !data?.value) return;
      try {
        const value = JSON.parse(data.value as string);
        if (value?.url) setBackground({ type: value.type === 'video' ? 'video' : 'image', url: value.url });
      } catch { /* ignora valor inválido */ }
    });
    return () => { active = false; };
  }, []);

  const scrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden bg-black pt-20">
      <div className="absolute inset-0">
        {background.type === 'video' ? (
          <video
            src={background.url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={background.url}
            alt="Arquitetura sofisticada"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
      </div>


      <div className="container relative z-10 px-4 pb-16 md:pb-24 lg:pb-28">
        <div className="max-w-4xl text-left">
          <p className="mb-5 text-xs md:text-sm uppercase tracking-[0.35em] text-white/75 font-medium">
            ImobiSpace Home · Paraná & Santa Catarina
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.95] text-white">
            Experiências únicas
            <span className="block text-primary mt-2">para morar ou investir.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base md:text-lg leading-relaxed text-white/75 font-light">
            Imóveis selecionados no Paraná e em Santa Catarina para quem procura localização, qualidade de vida e potencial de valorização.
          </p>

          <div className="mt-10 max-w-4xl rounded-2xl border border-white/15 bg-black/50 p-3 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1 rounded-xl bg-white/95 px-5 py-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/50">O que você procura?</p>
                <p className="mt-1 text-sm font-medium text-black/80">Cidade, bairro ou empreendimento</p>
              </div>
              <Button onClick={scrollToProperties} size="lg" className="h-auto rounded-xl bg-primary px-7 py-4 text-primary-foreground hover:bg-primary/90">
                <Search className="mr-2 h-5 w-5" />
                Buscar imóveis
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-white/55">
            <span>Alto padrão</span>
            <span>Lançamentos</span>
            <span>Paraná</span>
            <span>Santa Catarina</span>
            <span>Atendimento personalizado</span>
          </div>
        </div>
      </div>

      <button onClick={scrollToProperties} className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-white/60 transition hover:text-white" aria-label="Ver imóveis">
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </button>
    </section>
  );
}
