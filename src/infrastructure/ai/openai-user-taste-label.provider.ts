import { Injectable, Logger } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type {
  UserTasteLabelEnhancer,
  UserTasteLabelMetadata,
} from '@domain/users/services/user-taste-label-enhancer.interface';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';

@Injectable()
export class OpenAiUserTasteLabelProvider implements UserTasteLabelEnhancer {
  private readonly logger = new Logger(OpenAiUserTasteLabelProvider.name);

  constructor(private readonly openAiClient: OpenAiClientService) {}

  async enhance(label: string): Promise<UserTasteLabelMetadata> {
    const cleaned = label.trim();

    if (!cleaned.length) {
      throw new Error('Cannot enhance an empty user taste label');
    }

    try {
      const completion = await this.openAiClient.createChatCompletion({
        model: this.openAiClient.defaultTasteLabelModel,
        temperature: 0.1,
        max_tokens: 256,
        messages: this.buildMessages(cleaned),
      });

      const rawContent = completion.choices[0]?.message?.content;
      const keywords = this.extractKeywords(rawContent);
      const searchLabel = this.joinKeywords(cleaned, keywords);

      return {
        originalLabel: cleaned,
        searchLabel,
      } satisfies UserTasteLabelMetadata;
    } catch (error) {
      this.logger.warn(
        'Falling back to original label because the AI enhancer failed',
        error instanceof Error ? error : new Error(String(error)),
      );

      return {
        originalLabel: cleaned,
        searchLabel: cleaned,
      } satisfies UserTasteLabelMetadata;
    }
  }

  private buildMessages(label: string): ChatCompletionMessageParam[] {
    return [
      {
        role: 'system',
        content:
          'You are a data enrichment assistant that expands noisy user taste descriptions into high quality, multilingual search labels. You MUST return ONLY a valid JSON object. Do not include any other text, explanations, or markdown formatting.',
      },
      {
        role: 'user',
        content: `Given the user taste "${label}", build a JSON object using this TypeScript type:

type TasteLabel = { keywords: string[] };

Rules:
- keywords must be lowercase, trimmed, and unique
- include spelling corrections, synonyms, categories, related products, and translations (pt-BR if possible)
- capture up to 32 relevant entries ordered from most to least specific
- prefer single or short multi-word phrases (max 4 words)
- do not explain the JSON, only output the JSON literal

Example output:
{"keywords":["games","video game deals","jogos eletrônicos","ps5","xbox","nintendo","gaming accessories","promoções de jogos"]}
`,
      },
    ];
  }

  private extractKeywords(rawContent: string | null | undefined): string[] {
    if (!rawContent) {
      return [];
    }

    // Remove markdown code blocks if present
    let content = rawContent.replace(/```json\n?|\n?```/g, '').trim();
    // Also remove generic code blocks
    content = content.replace(/```\n?|\n?```/g, '').trim();

    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      return this.fallbackSplit(rawContent);
    }

    try {
      const sliced = content.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(sliced) as { keywords?: unknown };
      const keywordsField = parsed.keywords;
      let keywordsRaw: unknown[] = [];

      if (Array.isArray(keywordsField)) {
        keywordsRaw = keywordsField;
      }

      return keywordsRaw
        .map((keyword) =>
          typeof keyword === 'string' ? keyword.trim().toLowerCase() : null,
        )
        .filter((keyword): keyword is string => Boolean(keyword));
    } catch (error) {
      this.logger.debug('Unable to parse taste label JSON, using fallback', {
        rawContent,
        error: error instanceof Error ? error.message : String(error),
      });
      return this.fallbackSplit(rawContent);
    }
  }

  private fallbackSplit(rawContent: string): string[] {
    const disallowedPatterns = [
      /return\s+json/i,
      /type\s+taste/i,
      /given\s+the\s+user/i,
      /rules?:/i,
      /example\s+output/i,
      /need\s+keywords/i,
      /keywords/i,
    ];

    return rawContent
      .split(/[|,\n]/)
      .map((part) => this.sanitizeToken(part))
      .filter((part) => part.length > 0)
      .filter((part) => part.length <= 60)
      .filter((part) =>
        disallowedPatterns.every((pattern) => !pattern.test(part)),
      );
  }

  private sanitizeToken(value: string): string {
    let token = value.trim().toLowerCase();

    token = token.replace(/[{}()]/g, '');
    token = token.replace(/\[/g, '').replace(/\]/g, '');
    token = token.replace(/^['"`]+/, '').replace(/['"`]+$/, '');
    token = token.replace(/\s{2,}/g, ' ');

    return token.trim();
  }
  private joinKeywords(baseLabel: string, keywords: string[]): string {
    const values = keywords.length ? keywords : [baseLabel.toLowerCase()];
    const unique = Array.from(new Set(values));
    return unique.join(' | ');
  }
}
