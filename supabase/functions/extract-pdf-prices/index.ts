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
    const { pdfUrl } = await req.json();

    if (!pdfUrl) {
      throw new Error('PDF URL is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Downloading PDF from:', pdfUrl);

    // Baixar o PDF e converter para base64
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error('Não foi possível baixar o PDF');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Converter para base64 usando btoa
    const uint8Array = new Uint8Array(pdfBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const pdfBase64 = btoa(binary);

    const prompt = `Analise este PDF de tabela de preços de um empreendimento imobiliário e extraia as informações de cada unidade/apartamento.

Para cada unidade encontrada, extraia:
- unit_type: Tipo/Nome da unidade (ex: "Apto 101", "Tipo A", "2 quartos")
- area_m2: Área em metros quadrados (número decimal)
- bedrooms: Número de quartos (número inteiro ou null)
- suites: Número de suítes (número inteiro ou null)
- parking_spots: Número de vagas (número inteiro ou null)
- floor: Andar (texto ou null)
- price: Preço em reais (número, sem formatação)
- status: Status (available, reserved, ou sold)

Retorne APENAS um JSON válido no seguinte formato, sem nenhum texto adicional:
{
  "prices": [
    {
      "unit_type": "Apto 101",
      "area_m2": 65.5,
      "bedrooms": 2,
      "suites": 1,
      "parking_spots": 1,
      "floor": "1º",
      "price": 350000,
      "status": "available"
    }
  ]
}

Se não conseguir extrair preços, retorne: {"prices": [], "error": "Não foi possível extrair preços deste PDF"}`;

    // Fazer a requisição para a API de IA com o PDF em base64
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Erro ao processar PDF com IA');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response content:', content?.substring(0, 200));

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    // Extrair o JSON da resposta
    let pricesData;
    try {
      // Tenta encontrar o JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pricesData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      throw new Error('Erro ao interpretar resposta da IA');
    }

    console.log('Extracted prices:', pricesData.prices?.length || 0);

    return new Response(JSON.stringify(pricesData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error in extract-pdf-prices:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, prices: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});