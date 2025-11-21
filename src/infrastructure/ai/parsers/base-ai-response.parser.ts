import { Logger } from '@nestjs/common';
import type { ChatCompletion } from 'openai/resources/chat/completions';

export abstract class BaseAiResponseParser<T> {
  protected abstract readonly logger: Logger;

  abstract parse(completion: ChatCompletion): T | null;

  protected getRawContent(completion: ChatCompletion): string | null {
    const rawContent = completion.choices[0]?.message?.content;

    if (typeof rawContent !== 'string' || !rawContent.length) {
      this.logger.warn('AI provider returned empty content');
      return null;
    }

    return rawContent;
  }

  protected extractJson(raw: string): unknown {
    if (raw.trim() === 'null') {
      return null;
    }

    let content = raw.replace(/```json\n?|\n?```/g, '').trim();
    content = content.replace(/```\n?|\n?```/g, '').trim();

    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      return null;
    }

    try {
      const sliced = content.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(sliced) as unknown;
    } catch (error) {
      this.logger.debug('Failed to parse JSON response', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  protected toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  protected toStringArray(value: unknown): string[] {
    if (value === null || value === undefined) {
      return [];
    }

    const items = Array.isArray(value) ? value : [value];
    const normalized = items
      .map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : undefined,
      )
      .filter((item): item is string => Boolean(item));

    return Array.from(new Set(normalized));
  }

  protected isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
