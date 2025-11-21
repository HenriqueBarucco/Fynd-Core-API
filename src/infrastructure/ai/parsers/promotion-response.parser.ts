import { Logger } from '@nestjs/common';
import type { ChatCompletion } from 'openai/resources/chat/completions';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import { BaseAiResponseParser } from './base-ai-response.parser';

type PromotionCandidate = Partial<PromotionPayload> & {
  coupon?: string;
  couponCode?: string;
};

export class PromotionResponseParser extends BaseAiResponseParser<PromotionPayload> {
  protected readonly logger = new Logger(PromotionResponseParser.name);

  parse(completion: ChatCompletion): PromotionPayload | null {
    const rawContent = this.getRawContent(completion);

    if (!rawContent) {
      return null;
    }

    try {
      return this.parsePayload(rawContent);
    } catch (error) {
      this.logger.warn(
        'Unable to parse promotion payload',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  private parsePayload(raw: string): PromotionPayload | null {
    const parsed = this.extractJson(raw);

    if (!parsed || !this.isObject(parsed)) {
      this.logger.debug('Failed to extract valid JSON from AI response');
      return null;
    }

    const candidate = parsed as PromotionCandidate;
    this.logger.debug(
      `Parsing promotion candidate: ${JSON.stringify(candidate)}`,
    );

    const currentPrice = this.toNumber(candidate.currentPrice);
    const couponCodes = this.toStringArray(
      candidate.couponCodes ?? candidate.couponCode ?? candidate.coupon,
    );

    if (!candidate.name) {
      this.logger.debug('Rejecting promotion: missing name');
      return null;
    }

    if (currentPrice === undefined && !couponCodes?.length) {
      this.logger.debug(
        'Rejecting promotion: must have either currentPrice or couponCodes',
      );
      return null;
    }

    const promotion = {
      name: String(candidate.name).trim(),
      currentPrice: currentPrice ?? null,
      previousPrice: this.toNumber(candidate.previousPrice),
      currency: candidate.currency,
      type: candidate.type ?? 'unknown',
      link: candidate.link,
      couponCodes,
      description: candidate.description,
      expiresAt: candidate.expiresAt,
      tags: this.toStringArray(candidate.tags),
    } satisfies PromotionPayload;

    this.logger.debug(
      `Successfully parsed promotion: ${promotion.name} (type: ${promotion.type}, coupons: ${couponCodes?.length ?? 0})`,
    );

    return promotion;
  }
}
