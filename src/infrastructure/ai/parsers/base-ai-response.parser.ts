/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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

    const sanitized = raw
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();

    return (
      this.tryParseJson(sanitized) ??
      this.extractStructuredJson(sanitized, '{') ??
      this.extractStructuredJson(sanitized, '[')
    );
  }

  private tryParseJson(content: string): unknown | null {
    if (!content.length) {
      return null;
    }

    try {
      return JSON.parse(content) as unknown;
    } catch (error) {
      this.logger.debug('Failed to parse JSON response', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private extractStructuredJson(
    content: string,
    opening: '{' | '[',
  ): unknown | null {
    const closing = opening === '{' ? '}' : ']';
    const start = content.indexOf(opening);

    if (start === -1) {
      return null;
    }

    const sliced = this.sliceBalanced(content, start, opening, closing);
    return sliced ? this.tryParseJson(sliced) : null;
  }

  private sliceBalanced(
    content: string,
    start: number,
    opening: string,
    closing: string,
  ): string | null {
    let depth = 0;
    let inString = false;
    let previous = '';

    for (let index = start; index < content.length; index += 1) {
      const char = content[index];

      if (char === '"' && previous !== '\\') {
        inString = !inString;
      }

      if (!inString) {
        if (char === opening) {
          depth += 1;
        } else if (char === closing) {
          depth -= 1;

          if (depth === 0) {
            return content.slice(start, index + 1);
          }
        }
      }

      previous = char;
    }

    return null;
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
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
