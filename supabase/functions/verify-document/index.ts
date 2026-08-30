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
    const { imageBase64, documentType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ isValid: false, reason: 'Nenhuma imagem fornecida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analisando documento:', documentType);

    const prompt = `Você é um especialista em análise de documentos. Analise esta imagem de documento e verifique:

1. **Nitidez**: O documento está nítido e legível? As letras e números podem ser lidos claramente?
2. **Completude**: O documento inteiro está visível na imagem? Não está cortado?
3. **Qualidade**: A imagem tem boa iluminação? Não está muito escura ou com reflexos?
4. **Autenticidade**: Parece ser um documento real (${documentType})?

Responda em JSON com este formato exato:
{
  "isValid": true/false,
  "score": 0-100,
  "issues": ["lista de problemas encontrados"],
  "recommendation": "texto curto com recomendação se houver problema"
}

Se o documento estiver legível, nítido e completo, responda isValid: true e score acima de 70.
Se houver problemas que impeçam a leitura ou verificação, responda isValid: false.`;

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
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      // Em caso de erro, permitir o upload (não bloquear)
      return new Response(
        JSON.stringify({ isValid: true, score: 100, issues: [], recommendation: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    console.log('Resposta da IA:', content);

    // Tentar extrair JSON da resposta
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
    }

    // Fallback: permitir upload
    return new Response(
      JSON.stringify({ isValid: true, score: 100, issues: [], recommendation: '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    // Em caso de erro, permitir o upload
    return new Response(
      JSON.stringify({ isValid: true, score: 100, issues: [], recommendation: '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
