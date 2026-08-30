import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, MessageCircle } from 'lucide-react';

const COMPANY_WHATSAPP = '5541991380330';

export default function ProposalSuccess() {
  const whatsappMessage = encodeURIComponent(
    'Olá, ImobiSpace Home! Uma nova proposta foi finalizada pelo site. Os dados e documentos da proposta estão registrados no sistema. Por favor, verificar o painel de propostas.'
  );
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${whatsappMessage}`;

  useEffect(() => {
    // Abre a conversa da empresa após a conclusão da proposta.
    // O WhatsApp exige que o envio final da mensagem seja confirmado pelo usuário.
    const timer = window.setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [whatsappUrl]);

  return (
    <Layout>
      <div className="container py-20 max-w-lg">
        <Card className="border-0 shadow-luxury text-center">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-4 animate-slide-up">
              Proposta Enviada!
            </h1>

            <p className="text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Seus dados e documentos foram registrados com sucesso. A conversa com a ImobiSpace Home será aberta no WhatsApp para avisar nossa equipe sobre a nova proposta.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 text-left">
                <MessageCircle className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp da ImobiSpace Home</p>
                  <p className="text-xs text-muted-foreground">
                    Se o WhatsApp não abrir automaticamente, toque no botão abaixo para falar com a empresa.
                  </p>
                </div>
              </div>
            </div>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block mb-3">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="w-4 h-4 mr-2" />
                Avisar a ImobiSpace no WhatsApp
              </Button>
            </a>

            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Voltar para Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
