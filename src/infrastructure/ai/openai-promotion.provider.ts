import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { OpenAI as OpenAIClient } from 'openai';
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { PromotionAiProvider } from '@domain/promotions/providers/promotion-ai.provider';

@Injectable()
export class OpenAiPromotionProvider implements PromotionAiProvider {
  private readonly logger = new Logger(OpenAiPromotionProvider.name);
  private readonly client: OpenAIClient;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('LM_STUDIO_API_KEY') ?? 'lm-studio';
    const baseURL =
      this.configService.get<string>('LM_STUDIO_BASE_URL') ??
      'http://localhost:1234/v1';

    this.model =
      this.configService.get<string>('LM_STUDIO_MODEL') ?? 'gpt-4o-mini';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async generatePromotionFromMessage(
    message: string,
  ): Promise<PromotionPayload | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const completion = (await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: this.buildMessages(message),
      })) as ChatCompletion;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const rawContent = completion.choices[0]?.message?.content;

      if (typeof rawContent !== 'string' || !rawContent.length) {
        this.logger.warn('OpenAI provider returned empty content');
        return null;
      }

      return this.parsePayload(rawContent);
    } catch (error) {
      this.logger.error(
        'Failed to generate promotion payload',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  private buildMessages(message: string): ChatCompletionMessageParam[] {
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
name (string), currentPrice (number), previousPrice (number | null), currency (string | null), type (string such as coupon, product, service, bundle, membership, unknown), link (string | null), couponCode (string | null), description (string | null), expiresAt (ISO date string | null), tags (array of lowercase keywords describing the promotion such as ["games","tech"]).
Always include at least one tag when a promotion exists. Tags should be concise, lowercase, and reflect the product category or benefit.
If no promotion data exists, respond with the literal string null.`,
      },
    ];
  }

  private parsePayload(raw: string): PromotionPayload | null {
    try {
      const parsed = this.extractJson(raw);

      if (!parsed) {
        return null;
      }

      const currentPrice = this.toNumber(parsed.currentPrice);

      if (!parsed.name || currentPrice === undefined) {
        return null;
      }

      return {
        name: String(parsed.name).trim(),
        currentPrice,
        previousPrice: this.toNumber(parsed.previousPrice),
        currency: parsed.currency,
        type: parsed.type ?? 'unknown',
        link: parsed.link,
        couponCode: parsed.couponCode ?? parsed.coupon,
        description: parsed.description,
        expiresAt: parsed.expiresAt,
        tags: this.toStringArray(parsed.tags),
      } satisfies PromotionPayload;
    } catch (error) {
      this.logger.warn(
        'Unable to parse promotion payload',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  private extractJson(
    raw: string,
  ): (Partial<PromotionPayload> & { coupon?: string }) | null {
    if (raw.trim() === 'null') {
      return null;
    }

    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      return null;
    }

    const sliced = raw.slice(jsonStart, jsonEnd + 1);
    const candidate = JSON.parse(sliced) as unknown;

    return this.isPromotionCandidate(candidate) ? candidate : null;
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private toStringArray(value: unknown): string[] | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const items = Array.isArray(value) ? value : [value];
    const normalized = items
      .map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : undefined,
      )
      .filter((item): item is string => Boolean(item));

    const unique = Array.from(new Set(normalized));
    return unique.length ? unique : undefined;
  }

  private isPromotionCandidate(
    value: unknown,
  ): value is Partial<PromotionPayload> & { coupon?: string } {
    return typeof value === 'object' && value !== null;
  }
}
