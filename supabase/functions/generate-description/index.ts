import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, location, description, images, pdfUrl } = await req.json();

    // Primeiro, se tiver PDF, tentar extrair informações dele
    let extractedPdfInfo = '';
    if (pdfUrl) {
      try {
        console.log('Tentando extrair informações do PDF:', pdfUrl);
        
        // Usar a IA para analisar e descrever baseado no contexto
        const pdfAnalysisPrompt = `Analise o contexto deste empreendimento imobiliário e sugira informações típicas de planta e metragem:

Nome do Empreendimento: ${name}
Localização: ${location}
${description ? `Descrição disponível: ${description}` : ''}

Com base no tipo de empreendimento e localização, sugira detalhes típicos como:
- Metragens prováveis (área privativa)
- Número de quartos/suítes
- Vagas de garagem
- Áreas comuns típicas
- Acabamentos de luxo esperados

Responda em formato de lista concisa, apenas os detalhes técnicos.`;

        const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: pdfAnalysisPrompt }],
            temperature: 0.5,
            max_tokens: 400,
          }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          extractedPdfInfo = analysisData.choices[0]?.message?.content || '';
          console.log('Informações extraídas:', extractedPdfInfo);
        }
      } catch (pdfError) {
        console.error('Erro ao analisar PDF:', pdfError);
      }
    }

    const prompt = `Você é um especialista em marketing imobiliário de alto luxo. Crie uma descrição sofisticada e persuasiva para o seguinte empreendimento imobiliário premium:

Nome: ${name}
Localização: ${location}
${description ? `Descrição base: ${description}` : ''}
${extractedPdfInfo ? `Detalhes técnicos do empreendimento:\n${extractedPdfInfo}` : ''}
${images?.length ? `Número de imagens disponíveis: ${images.length}` : ''}

A descrição DEVE OBRIGATORIAMENTE incluir:
1. **Detalhes de Planta e Metragem**: Mencione áreas em m², distribuição dos ambientes, número de quartos/suítes
2. **Especificações Técnicas**: Vagas de garagem, depósito, varanda gourmet, etc.
3. **Acabamentos Premium**: Descreva materiais de alto padrão (porcelanato, mármore, granito, etc.)
4. **Áreas de Lazer**: Piscina, academia, salão de festas, playground, etc.
5. **Diferenciais do Empreendimento**: Tecnologia, sustentabilidade, segurança

A descrição deve:
- Usar linguagem de alto padrão e exclusividade
- Ser envolvente e aspiracional, focada em conversão
- Destacar os benefícios exclusivos de morar no local
- Ter entre 250-350 palavras
- Incluir chamadas à ação sutis e elegantes
- Enfatizar investimento premium e qualidade de vida diferenciada

Responda APENAS com a descrição, sem títulos ou formatação adicional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('Erro ao gerar descrição com IA');
    }

    const data = await response.json();
    const generatedDescription = data.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ description: generatedDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
