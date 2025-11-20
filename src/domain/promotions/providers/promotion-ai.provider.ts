import type { PromotionPayload } from '@domain/promotions/promotion.interface';

export interface PromotionAiProvider {
  generatePromotionFromMessage(
    message: string,
  ): Promise<PromotionPayload | null>;
}
