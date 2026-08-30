import { Layout } from '@/components/layout/Layout';
import { ArrowRight, Award, Heart, Users } from 'lucide-react';

const About = () => (
  <Layout>
    <main className="bg-background">
      <section className="relative overflow-hidden bg-secondary px-4 pb-24 pt-40 text-white">
        <div className="container relative z-10 max-w-6xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-primary">ImobiSpace Home · Paraná & Santa Catarina</p>
          <h1 className="font-display max-w-4xl text-5xl font-medium leading-tight md:text-7xl">Mais do que imóveis.<br /><span className="text-primary">Uma rede construída pela confiança.</span></h1>
          <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-white/65">Uma imobiliária construída para crescer no Paraná e em Santa Catarina, com relacionamento, reputação e uma experiência que merece ser indicada.</p>
        </div>
      </section>

      <section className="container max-w-6xl px-4 py-24">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div><p className="text-xs uppercase tracking-[0.3em] text-primary">Nossa essência</p><h2 className="mt-4 font-display text-4xl md:text-5xl">IMOBISPACE HOME</h2></div>
          <div className="space-y-14 text-muted-foreground leading-relaxed">
            <article><h3 className="mb-4 font-display text-3xl text-foreground">Nossa Missão</h3><p>Construir uma imobiliária forte, confiável e preparada para crescer no Paraná e em Santa Catarina, oferecendo uma experiência de atendimento que faça nossos clientes não apenas escolherem a Imobispace Home, mas também terem orgulho de nos indicar para familiares, amigos e pessoas próximas.</p></article>
            <article><h3 className="mb-4 font-display text-3xl text-foreground">Nossa Visão</h3><p>Ser uma das imobiliárias mais respeitadas do Sul do Brasil, com forte presença no Paraná e em Santa Catarina, formando uma grande rede de clientes, parceiros e profissionais que crescem junto com a Imobispace Home. Queremos que nossa principal força seja construída através da confiança, da indicação e dos resultados que entregamos.</p></article>
            <article className="border-l border-primary pl-7"><h3 className="mb-4 font-display text-3xl text-foreground">Nosso Propósito</h3><p className="mb-5 text-xl font-medium text-foreground">Crescer através de pessoas que confiam em nós.</p><p>Queremos construir algo maior do que uma imobiliária. Queremos criar uma <strong className="text-foreground">rede de confiança</strong>, onde cada cliente atendido possa se tornar uma nova oportunidade, indicando alguém que também precisa de um imóvel, quer realizar o sonho da casa própria ou busca uma oportunidade de investimento.</p><p className="mt-4">Cada venda deve representar muito mais do que uma negociação concluída. Deve representar <strong className="text-foreground">uma experiência tão positiva que gere uma nova indicação, uma nova família atendida e uma nova história para contar.</strong></p></article>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-4 py-24 text-white"><div className="container max-w-6xl"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.3em] text-primary">Nosso jeito de pensar</p><h2 className="mt-4 font-display text-4xl md:text-5xl">Uma venda pode iniciar uma rede inteira.</h2></div><div className="mt-14 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 p-7"><Heart className="mb-6 text-primary"/><h3 className="font-display text-2xl">Confiança</h3><p className="mt-3 text-sm leading-relaxed text-white/55">Relacionamentos que permanecem depois da negociação.</p></div><div className="rounded-2xl border border-white/10 p-7"><Users className="mb-6 text-primary"/><h3 className="font-display text-2xl">Indicação</h3><p className="mt-3 text-sm leading-relaxed text-white/55">Clientes satisfeitos que apresentam a marca para novas pessoas.</p></div><div className="rounded-2xl border border-white/10 p-7"><Award className="mb-6 text-primary"/><h3 className="font-display text-2xl">Reputação</h3><p className="mt-3 text-sm leading-relaxed text-white/55">Resultados consistentes que transformam atendimento em reconhecimento.</p></div></div><div className="mt-16 border-t border-white/10 pt-10"><p className="font-display text-2xl md:text-3xl">Cliente satisfeito <span className="text-primary">→</span> Indicação <span className="text-primary">→</span> Novo cliente <span className="text-primary">→</span> Novo resultado <span className="text-primary">→</span> Mais confiança</p></div></div></section>

      <section className="container max-w-6xl px-4 py-24 text-center"><p className="mx-auto max-w-3xl font-display text-3xl leading-relaxed text-foreground md:text-5xl">Empresas realmente grandes não são construídas apenas com publicidade.<br /><span className="text-primary">São construídas com reputação, relacionamento e confiança.</span></p><p className="mx-auto mt-10 max-w-xl text-muted-foreground">ImobiSpace Home — uma imobiliária construída para crescer no Paraná e em Santa Catarina. Uma rede construída pela confiança.</p><a href="/" className="mt-8 inline-flex items-center text-xs uppercase tracking-[0.2em] text-foreground hover:text-primary">Conheça nossos imóveis <ArrowRight className="ml-2 h-4 w-4" /></a></section>
    </main>
  </Layout>
);

export default About;
