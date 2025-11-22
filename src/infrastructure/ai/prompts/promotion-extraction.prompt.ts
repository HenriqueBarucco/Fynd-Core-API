import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class PromotionExtractionPrompt {
  static build(message: string): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content:
          'Você é um extrator de promoções. Leia a mensagem recebida e responda SEMPRE apenas com JSON válido (ou o literal null). Nunca explique, nunca envolva em markdown, nunca envie texto adicional.',
      },
      {
        role: 'user',
        content: `Message: """${message}"""
                  Retorne APENAS UMA das opções:
                  1) Um objeto JSON com as chaves obrigatórias abaixo:
                     {
                       "name": string,
                       "currentPrice": number | null,
                       "previousPrice": number | null,
                       "currency": string | null,
                       "type": "coupon" | "product" | "service" | "bundle" | "membership" | "unknown",
                       "link": string | null,
                       "couponCodes": string[],
                       "description": string | null,
                       "expiresAt": string | null (ISO 8601),
                       "tags": string[] (sempre minúsculas)
                     }
                  2) O literal null (sem aspas) caso não haja promoção.

                  Regras cruciais:
                  - Responda sempre com JSON bruto, sem markdown, sem texto antes ou depois.
                  - Quando houver mais de uma promoção, escolha a mais relevante (maior desconto ou primeira citada) e mencione as demais dentro da descrição usando o formato "Ofertas adicionais: ..." em português.
                  - A descrição deve estar em pt-BR e incluir valores, benefícios e complementos relevantes.
                  - Sempre forneça um nome claro, mesmo para cupons sem preço final; nesses casos mantenha currentPrice como null.
                  - Mantenha currency no formato de símbolo (ex.: "R$", "$"), usando null quando não houver preço.
                  - Sempre retorne um array para couponCodes e tags; se não houver itens utilize [].
                  - As tags devem ser curtas, minúsculas e refletir a categoria (ex.: ["tech","tv"]).
                  - Nunca invente valores ou códigos inexistentes; use apenas o que estiver na mensagem.

                  Lembre-se: saída = JSON puro ou null literal.`,
      },
    ];
  }
}
