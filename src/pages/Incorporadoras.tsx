import { ArrowUpRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { incorporadoras } from '@/data/incorporadoras';

export default function Incorporadoras() {
  return (
    <Layout>
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-secondary px-4 pb-20 pt-36 text-white md:pb-28 md:pt-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Incorporadoras
              </div>
              <h1 className="font-display text-5xl leading-[0.98] md:text-7xl">Grandes nomes do mercado, lado a lado conosco.</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                Uma seleção de incorporadoras reconhecidas por qualidade, arquitetura, localização e excelência construtiva — marcas que fazem parte da nossa curadoria.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:py-28">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">Nossos parceiros</p>
              <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Marcas que compartilham do nosso padrão.</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {incorporadoras.map((incorporadora) => (
                <article key={incorporadora.id} className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.10)]">
                  <div className="flex min-h-[190px] items-center justify-center border-b border-black/5 bg-[#fafafa] px-10 py-10">
                    <img
                      src={incorporadora.logoUrl}
                      alt={`Logo ${incorporadora.name}`}
                      className="max-h-24 max-w-[250px] object-contain grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <span className="hidden font-display text-3xl text-black">{incorporadora.name}</span>
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h3 className="font-display text-3xl text-foreground">{incorporadora.name}</h3>
                        {incorporadora.location && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{incorporadora.location}</p>}
                      </div>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/45">Incorporadora</span>
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">{incorporadora.description}</p>
                    <Button asChild variant="ghost" className="mt-6 px-0 font-semibold text-foreground hover:bg-transparent hover:text-primary">
                      <a href={incorporadora.website} target="_blank" rel="noreferrer">
                        Ver todos os imóveis <ArrowUpRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white px-4 py-20">
          <div className="container text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">ImobiSpace Home</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl text-black md:text-5xl">Uma curadoria construída com grandes marcas.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">Conheça nossos empreendimentos e encontre a oportunidade que combina com o seu próximo momento.</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
