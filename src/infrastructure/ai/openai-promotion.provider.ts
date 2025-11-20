import { Injectable, Logger } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { PromotionAiProvider } from '@domain/promotions/providers/promotion-ai.provider';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';

@Injectable()
export class OpenAiPromotionProvider implements PromotionAiProvider {
  private readonly logger = new Logger(OpenAiPromotionProvider.name);
  constructor(private readonly openAiClient: OpenAiClientService) {}

  async generatePromotionFromMessage(
    message: string,
  ): Promise<PromotionPayload | null> {
    try {
      const completion = await this.openAiClient.createChatCompletion({
        model: this.openAiClient.defaultPromotionModel,
        temperature: 0.2,
        messages: this.buildMessages(message),
      });

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

  private toStringArray(value: unknown): string[] {
    if (value === null || value === undefined) {
      return [];
    }

    const items = Array.isArray(value) ? value : [value];
    const normalized = items
      .map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : undefined,
      )
      .filter((item): item is string => Boolean(item));

    const unique = Array.from(new Set(normalized));
    return unique;
  }

  private isPromotionCandidate(
    value: unknown,
  ): value is Partial<PromotionPayload> & { coupon?: string } {
    return typeof value === 'object' && value !== null;
  }
}
