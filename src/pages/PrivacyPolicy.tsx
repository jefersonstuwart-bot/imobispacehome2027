import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar ao Início
        </Link>

        <div className="space-y-12">
          {/* Política de Privacidade */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Política de Privacidade
              </h1>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Política de Privacidade – ImobiSpace Home
              </h2>
              
              <p>
                A sua privacidade é importante para nós. É política do ImobiSpace Home respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site ImobiSpace Home, e outros sites que possuímos e operamos.
              </p>

              <p>
                Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço, como envio de propostas, análise de interesse em imóveis, contato comercial ou envio de documentos. Fazemos isso por meios justos e legais, com o seu conhecimento e consentimento.
              </p>

              <p>
                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas, roubos, acessos não autorizados, divulgação, cópia, uso ou modificação.
              </p>

              <p>
                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou mediante autorização do titular.
              </p>

              <p>
                O nosso site pode ter links para sites externos que não são operados por nós. Não nos responsabilizamos pelas práticas de privacidade desses sites.
              </p>

              <p>
                Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
              </p>

              <p>
                O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais.
              </p>

              <p>
                Caso tenha qualquer dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
              </p>
            </div>
          </section>

          {/* LGPD */}
          <section className="space-y-6 border-t border-border pt-12">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                LGPD – Lei Geral de Proteção de Dados
              </h1>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Política de Proteção de Dados – LGPD
              </h2>

              <p>
                O ImobiSpace Home está em conformidade com a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">1. Coleta de Dados</h3>
                <p>Coletamos dados pessoais fornecidos diretamente pelo usuário, tais como:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nome completo</li>
                  <li>E-mail</li>
                  <li>Telefone</li>
                  <li>Documentos enviados para análise de proposta</li>
                  <li>Informações relacionadas a interesse em imóveis</li>
                </ul>
                <p>Esses dados são coletados por meio de formulários, upload de documentos, cadastro e interação com a plataforma.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">2. Finalidade do Uso dos Dados</h3>
                <p>Os dados coletados são utilizados para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Análise de propostas imobiliárias</li>
                  <li>Contato comercial</li>
                  <li>Atendimento ao cliente</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Melhoria da experiência do usuário na plataforma</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">3. Armazenamento e Segurança</h3>
                <p>
                  Os dados são armazenados em ambientes seguros, protegidos contra acesso não autorizado, vazamentos e usos indevidos, adotando medidas técnicas e organizacionais adequadas.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">4. Compartilhamento de Dados</h3>
                <p>Os dados pessoais não são vendidos. Poderão ser compartilhados apenas:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Com parceiros essenciais para execução do serviço (ex: análise de crédito ou documentação), quando necessário</li>
                  <li>Por obrigação legal ou ordem judicial</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">5. Direitos do Titular dos Dados</h3>
                <p>Nos termos da LGPD, o usuário pode solicitar:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Confirmação da existência de tratamento de dados</li>
                  <li>Acesso aos seus dados</li>
                  <li>Correção de dados incompletos ou desatualizados</li>
                  <li>Exclusão de dados, quando aplicável</li>
                  <li>Revogação do consentimento</li>
                </ul>
                <p>As solicitações podem ser feitas através dos canais de contato do site.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">6. Consentimento</h3>
                <p>
                  Ao utilizar o site ImobiSpace Home, o usuário declara estar ciente e de acordo com esta Política de Privacidade e com o tratamento de seus dados pessoais conforme descrito.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
