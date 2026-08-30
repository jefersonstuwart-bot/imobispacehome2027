import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ChevronLeft, ScrollText } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar ao Início
        </Link>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <ScrollText className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Termos de Uso
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Termos de Uso – ImobiSpace Home
            </h2>

            <p>
              Ao acessar e utilizar o site ImobiSpace Home, o usuário concorda integralmente com os presentes Termos de Uso. Caso não concorde com qualquer condição aqui descrita, recomenda-se que não utilize a plataforma.
            </p>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">1. Objeto</h3>
              <p>
                O ImobiSpace Home é uma plataforma digital destinada à divulgação de empreendimentos imobiliários, disponibilização de materiais informativos (imagens e PDFs), geração automática de descrições por inteligência artificial, envio de propostas e upload de documentos para análise.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">2. Uso da Plataforma</h3>
              <p>O usuário compromete-se a utilizar o site apenas para fins lícitos, sendo proibido:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Fornecer informações falsas ou de terceiros sem autorização</li>
                <li>Enviar documentos fraudulentos ou ilegais</li>
                <li>Utilizar a plataforma para fins ilícitos ou que violem a legislação vigente</li>
                <li>Tentar acessar áreas restritas ou sistemas sem autorização</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">3. Cadastro e Informações</h3>
              <p>
                Para utilizar determinadas funcionalidades, o usuário poderá fornecer dados pessoais e documentos. O usuário declara que todas as informações enviadas são verdadeiras, atualizadas e de sua titularidade.
              </p>
              <p>
                O ImobiSpace Home não se responsabiliza por informações incorretas fornecidas pelo usuário.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">4. Propostas e Documentação</h3>
              <p>
                O envio de propostas e documentos não garante aprovação, financiamento, reserva ou aquisição do imóvel, tratando-se apenas de uma manifestação de interesse sujeita à análise posterior.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">5. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo disponibilizado no site, incluindo textos, imagens, descrições geradas por inteligência artificial, logotipos, marcas e layout, é de propriedade do ImobiSpace Home ou de seus parceiros, sendo proibida a reprodução sem autorização prévia.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">6. Inteligência Artificial</h3>
              <p>
                As descrições geradas por inteligência artificial possuem caráter informativo e promocional, podendo sofrer ajustes, revisões ou atualizações. O ImobiSpace Home não garante que tais descrições substituam informações oficiais fornecidas por construtoras, incorporadoras ou agentes financeiros.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">7. Limitação de Responsabilidade</h3>
              <p>O ImobiSpace Home não se responsabiliza por:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Decisões tomadas com base nas informações do site</li>
                <li>Eventuais indisponibilidades técnicas</li>
                <li>Conteúdos de sites de terceiros acessados por links externos</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">8. Privacidade e Proteção de Dados</h3>
              <p>
                O tratamento de dados pessoais segue o disposto na{' '}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade e na Política de LGPD
                </Link>
                , que fazem parte integrante destes Termos.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">9. Alterações dos Termos</h3>
              <p>
                O ImobiSpace Home poderá atualizar estes Termos de Uso a qualquer momento, sendo responsabilidade do usuário consultá-los periodicamente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">10. Foro</h3>
              <p>
                Fica eleito o foro da comarca do domicílio do responsável pelo site, para dirimir quaisquer dúvidas oriundas destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
