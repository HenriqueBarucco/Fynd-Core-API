import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROMOTION_AI_PROVIDER } from '@domain/tokens';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { PromotionAiProvider } from '@domain/promotions/providers/promotion-ai.provider';

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  constructor(
    @Inject(PROMOTION_AI_PROVIDER)
    private readonly promotionProvider: PromotionAiProvider,
  ) {}

  async extractPromotion(message: string): Promise<PromotionPayload | null> {
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      this.logger.debug('Skipping promotion extraction for empty message');
      return null;
    }

    try {
      const promotion =
        await this.promotionProvider.generatePromotionFromMessage(
          trimmedMessage,
        );

      if (!promotion) {
        this.logger.debug('AI provider did not return a promotion payload');
        return null;
      }

      if (!promotion.name || promotion.currentPrice === undefined) {
        this.logger.warn('Promotion payload missing required fields');
        return null;
      }

      const normalized = {
        ...promotion,
        tags: this.normalizeTags(promotion.tags),
      } satisfies PromotionPayload;

      return normalized;
    } catch (error) {
      this.logger.error(
        'Failed to extract promotion from message',
        error as Error,
      );
      return null;
    }
  }

  private normalizeTags(tags?: string[]): string[] {
    if (!tags?.length) {
      return [];
    }

    const unique = Array.from(
      new Set(
        tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => Boolean(tag)),
      ),
    );

    return unique.length ? unique : [];
  }
}
