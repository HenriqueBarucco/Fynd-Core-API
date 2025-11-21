import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class PromotionExtractionPrompt {
  static build(message: string): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content:
          'You extract structured promotion data from raw customer messages. Only answer with valid JSON matching the expected schema.',
      },
      {
        role: 'user',
        content: `Message: """${message}"""
                  Extract a promotion JSON with the following keys:
                  name (string), currentPrice (number | null), previousPrice (number | null), currency (string | null), type (string such as coupon, product, service, bundle, membership, unknown), link (string | null), couponCodes (array of strings), description (string | null), expiresAt (ISO date string | null), tags (array of lowercase keywords describing the promotion such as ["games","tech"]).

                  Important rules:
                  - For coupon-only promotions without a specific final price, set currentPrice to null but ALWAYS provide a name describing the promotion/discount
                  - For coupon codes, extract them into the couponCodes array (e.g., ["AMIGOPRIME2", "AMIGOPRIME3"])
                  - Set type to "coupon" when the message is primarily about discount codes
                  - Always include at least one tag when a promotion exists. Tags should be concise, lowercase, and reflect the product category or benefit
                  - The description must always be in Portuguese (pt-BR) and should include any discount information mentioned
                  - For currency, always use the symbol format (e.g., "R$" for Brazilian Real, "$" for Dollar) instead of ISO codes (e.g., avoid "BRL", "USD")
                  
                  If no promotion data exists, respond with the literal string null.`,
      },
    ];
  }
}
