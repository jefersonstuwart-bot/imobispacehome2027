import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PartnersSection } from '@/components/home/PartnersSection';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Building2, BedDouble, Bath, Car, Ruler, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Index() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-with-prices'],
    queryFn: async () => {
      const { data: propertiesData, error: propertiesError } = await supabase.from('properties').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (propertiesError) throw propertiesError;
      const { data: pricesData, error: pricesError } = await supabase.from('property_prices').select('*');
      if (pricesError) throw pricesError;
      return propertiesData?.map(property => {
        const propertyPrices = pricesData?.filter(p => p.property_id === property.id) || [];
        if (!propertyPrices.length) return { ...property, priceStats: null };
        const areas = propertyPrices.map(p => Number(p.area_m2));
        const prices = propertyPrices.map(p => Number(p.price));
        const bedrooms = propertyPrices.map(p => p.bedrooms).filter(b => b !== null) as number[];
        const suites = propertyPrices.map(p => p.suites).filter(s => s !== null) as number[];
        const parkingSpots = propertyPrices.map(p => p.parking_spots).filter(p => p !== null) as number[];
        const minArea = Math.min(...areas);
        const minPrice = Math.min(...prices);
        return { ...property, priceStats: { minArea, maxArea: Math.max(...areas), minPrice, pricePerM2: minArea > 0 ? minPrice / minArea : 0, bedrooms: bedrooms.length ? Math.max(...bedrooms) : null, suites: suites.length ? Math.max(...suites) : null, parkingSpots: parkingSpots.length ? Math.max(...parkingSpots) : null } };
      });
    },
  });

  const filteredProperties = (properties || []).filter((property: any) => {
    const text = `${property.name || ''} ${property.location || ''}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesCity = !city || (property.location || '').toLowerCase().includes(city.toLowerCase());
    const matchesType = !type || (property.property_type || property.type || '').toLowerCase().includes(type.toLowerCase());
    const price = property.priceStats?.minPrice || 0;
    const matchesMin = !minPrice || price >= Number(minPrice);
    const matchesMax = !maxPrice || price <= Number(maxPrice);
    return matchesSearch && matchesCity && matchesType && matchesMin && matchesMax;
  });

  const scrollToProperties = () => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Layout>
      <HeroSection />

      <section className="relative z-20 -mt-8 px-4">
        <div className="container">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.12)] md:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div><p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">Encontre seu imóvel</p><h2 className="mt-1 font-display text-2xl md:text-3xl text-black">Uma busca feita para você</h2></div>
              <Button variant="outline" className="hidden md:flex border-black/15" onClick={scrollToProperties}>Pesquisa avançada <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome, bairro ou empreendimento" className="h-12 border-black/10 pl-11" /></div>
              <div className="relative"><MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" /><Input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade ou bairro" className="h-12 border-black/10 pl-11" /></div>
              <div className="relative"><Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" /><Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo de imóvel" className="h-12 border-black/10 pl-11" /></div>
              <Button onClick={scrollToProperties} className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"><Search className="mr-2 h-4 w-4" />Buscar imóveis</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Valor mínimo" className="h-11 border-black/10" />
              <Input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Valor máximo" className="h-11 border-black/10" />
              <select className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm" defaultValue=""><option value="">Quartos</option><option>1+</option><option>2+</option><option>3+</option><option>4+</option></select>
              <select className="h-11 rounded-md border border-black/10 bg-white px-3 text-sm" defaultValue=""><option value="">Vagas de garagem</option><option>1+</option><option>2+</option><option>3+</option><option>4+</option></select>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-black/55">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2"><BedDouble className="h-3.5 w-3.5" /> Quartos</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2"><Bath className="h-3.5 w-3.5" /> Suítes</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2"><Car className="h-3.5 w-3.5" /> Vagas</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2"><Ruler className="h-3.5 w-3.5" /> Área</span>
            </div>
          </div>
        </div>
      </section>

      <section id="properties" className="py-24 px-4 bg-background">
        <div className="container">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div><p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">Curadoria ImobiSpace</p><h2 className="font-display text-4xl md:text-5xl text-foreground mt-2">Lançamentos em destaque</h2><p className="mt-3 max-w-2xl text-muted-foreground">Arquitetura, localização e oportunidades selecionadas para morar ou investir.</p></div>
            <Button variant="outline" onClick={scrollToProperties} className="border-black/15">Ver todos os imóveis <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <PropertyGrid properties={filteredProperties} loading={isLoading} />
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-20 px-4">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">O padrão ImobiSpace</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-black">Escolhas feitas com critério.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">Uma experiência imobiliária baseada em curadoria, confiança e atendimento próximo — para que cada decisão tenha propósito.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:grid-cols-3">
            <div className="bg-white p-8 text-center md:text-left"><ShieldCheck className="h-6 w-6 text-primary" /><h3 className="mt-5 font-display text-2xl text-black">Confiança</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Relacionamento transparente do primeiro contato à entrega das chaves.</p></div>
            <div className="bg-white p-8 text-center md:text-left"><Sparkles className="h-6 w-6 text-primary" /><h3 className="mt-5 font-display text-2xl text-black">Curadoria</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Empreendimentos selecionados por localização, qualidade e potencial.</p></div>
            <div className="bg-white p-8 text-center md:text-left"><TrendingUp className="h-6 w-6 text-primary" /><h3 className="mt-5 font-display text-2xl text-black">Valorização</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Oportunidades para quem pensa no imóvel de hoje e no patrimônio de amanhã.</p></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary text-white px-4"><div className="container grid gap-10 md:grid-cols-2 md:items-center"><div><p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">ImobiSpace Home</p><h3 className="font-display mt-3 text-4xl md:text-5xl">Mais que uma imobiliária.<br />Uma curadoria para o seu próximo capítulo.</h3></div><div><p className="text-white/65 leading-relaxed">Atendimento personalizado para quem valoriza localização, arquitetura, segurança e potencial de valorização.</p><Button className="mt-7 bg-primary text-primary-foreground">Falar com um especialista <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></section>
      <PartnersSection />
    </Layout>
  );
}
