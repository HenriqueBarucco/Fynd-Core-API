export type PromotionType =
  | 'coupon'
  | 'product'
  | 'service'
  | 'bundle'
  | 'membership'
  | 'unknown';

export interface PromotionPayload {
  name: string;
  currentPrice: number | null;
  previousPrice?: number;
  currency?: string;
  type: PromotionType;
  link?: string;
  couponCodes?: string[];
  description?: string;
  expiresAt?: string;
  tags: string[];
}
