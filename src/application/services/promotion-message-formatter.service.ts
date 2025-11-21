import { Injectable } from '@nestjs/common';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';

interface FormattedPromotionMessageOptions {
  promotion: PromotionPayload;
  matchScore?: number;
}

@Injectable()
export class PromotionMessageFormatterService {
  private readonly DEFAULT_CURRENCY = 'R$';
  private readonly EMOJI = {
    FIRE: '🔥',
    LINK: '🔗',
    TICKET: '🎟️',
    PRICE: '💰',
    SCORE: '⭐',
  };

  format({ promotion, matchScore }: FormattedPromotionMessageOptions): string {
    const sections: string[] = [
      this.buildHeader(),
      this.buildTitle(promotion.name),
      this.buildPriceSection(promotion),
      this.buildDescription(promotion.description),
      this.buildLinkSection(promotion.link),
      this.buildCouponSection(promotion.couponCodes),
      this.buildMatchScoreSection(matchScore),
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  private buildHeader(): string {
    return `${this.EMOJI.FIRE} *New Promotion Detected!* ${this.EMOJI.FIRE}`;
  }

  private buildTitle(name: string): string {
    return `*${name}*`;
  }

  private buildPriceSection(promotion: PromotionPayload): string {
    if (!promotion.currentPrice) {
      return '';
    }

    const currency = promotion.currency ?? this.DEFAULT_CURRENCY;
    const currentPrice = this.formatPrice(promotion.currentPrice, currency);

    if (promotion.previousPrice) {
      const discount = this.calculateDiscountPercentage(
        promotion.previousPrice,
        promotion.currentPrice,
      );
      const previousPrice = this.formatPrice(promotion.previousPrice, currency);

      return `${this.EMOJI.PRICE} *${currentPrice}* ~${previousPrice}~ (-${discount}%)`;
    }

    return `${this.EMOJI.PRICE} *${currentPrice}*`;
  }

  private buildDescription(description?: string): string {
    if (!description?.trim()) {
      return '';
    }

    return description;
  }

  private buildLinkSection(link?: string): string {
    if (!link?.trim()) {
      return '';
    }

    return `${this.EMOJI.LINK} ${link}`;
  }

  private buildCouponSection(couponCodes?: string[]): string {
    if (!couponCodes?.length) {
      return '';
    }

    const coupons = couponCodes.map((code) => `\`${code}\``).join(', ');
    return `${this.EMOJI.TICKET} *Coupon(s):* ${coupons}`;
  }

  private buildMatchScoreSection(score?: number): string {
    if (score === undefined) {
      return '';
    }

    const percentage = (score * 100).toFixed(0);
    const stars = this.getStarRating(score);

    return `${this.EMOJI.SCORE} *Match:* ${percentage}% ${stars}`;
  }

  private formatPrice(price: number, currency: string): string {
    return `${currency} ${price.toFixed(2)}`;
  }

  private calculateDiscountPercentage(
    previousPrice: number,
    currentPrice: number,
  ): string {
    if (previousPrice <= 0) {
      return '0';
    }

    const discount = ((previousPrice - currentPrice) / previousPrice) * 100;
    return discount.toFixed(0);
  }

  private getStarRating(score: number): string {
    if (score >= 0.9) return '⭐⭐⭐⭐⭐';
    if (score >= 0.8) return '⭐⭐⭐⭐';
    if (score >= 0.7) return '⭐⭐⭐';
    if (score >= 0.6) return '⭐⭐';
    return '⭐';
  }
}
