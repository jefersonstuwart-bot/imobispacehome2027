import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { folderName, imageUrls, hasPdf, category } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const categoryText = category === "rent" ? "aluguel" : "venda";

    const prompt = `Você é um especialista em análise de imóveis. Analise as imagens fornecidas de um imóvel e extraia as seguintes informações:

NOME DA PASTA DO IMÓVEL: "${folderName}"

Com base nas imagens, identifique e retorne um JSON com:

1. "name": Um título atraente para o imóvel (use o nome da pasta como referência se necessário)
2. "description": Uma descrição persuasiva e comercial do imóvel com foco em ${categoryText}, destacando características, acabamentos e diferenciais. Máximo 300 palavras.
3. "propertyType": Tipo do imóvel (apartamento, casa, cobertura, studio, flat, kitnet, sala comercial, galpão, terreno, etc)
4. "bedrooms": Número de quartos (número inteiro ou null se não identificável)
5. "sizeM2": Tamanho aproximado em metros quadrados (número ou null se não identificável)
6. "location": Localização/bairro se identificável na imagem ou no nome da pasta (string ou "")
${category === "rent" ? '7. "rentalValue": Valor estimado de aluguel mensal em reais baseado no padrão do imóvel (número ou null)' : ""}

IMPORTANTE:
- Seja criativo e comercial na descrição
- Use linguagem persuasiva focada em ${categoryText}
- Destaque pontos fortes visíveis nas fotos
- Se não conseguir identificar algum campo, use null ou string vazia
- Retorne APENAS o JSON, sem markdown ou texto adicional

Exemplo de resposta:
{
  "name": "Apartamento Luxuoso com Vista Panorâmica",
  "description": "Deslumbrante apartamento com acabamento premium...",
  "propertyType": "apartamento",
  "bedrooms": 3,
  "sizeM2": 120,
  "location": "Jardins"${category === "rent" ? ',\n  "rentalValue": 5500' : ""}
}`;

    // Prepare images for the API
    const imageContent = imageUrls.slice(0, 5).map((url: string) => ({
      type: "image_url",
      image_url: { url },
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response
    let parsedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      // Return default values if parsing fails
      parsedData = {
        name: folderName,
        description: `Imóvel para ${categoryText} - ${folderName}`,
        propertyType: null,
        bedrooms: null,
        sizeM2: null,
        location: "",
        rentalValue: null,
      };
    }

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-property-batch:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
