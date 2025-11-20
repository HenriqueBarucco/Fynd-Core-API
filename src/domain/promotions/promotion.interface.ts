export type PromotionType =
  | 'coupon'
  | 'product'
  | 'service'
  | 'bundle'
  | 'membership'
  | 'unknown';

export interface PromotionPayload {
  name: string;
  currentPrice: number;
  previousPrice?: number;
  currency?: string;
  type: PromotionType;
  link?: string;
  couponCode?: string;
  description?: string;
  expiresAt?: string;
  tags: string[];
}
