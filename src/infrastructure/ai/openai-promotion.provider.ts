import { Injectable, Logger } from '@nestjs/common';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { PromotionAiProvider } from '@domain/promotions/providers/promotion-ai.provider';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';
import { PromotionExtractionPrompt } from '@infrastructure/ai/prompts/promotion-extraction.prompt';
import { PromotionResponseParser } from '@infrastructure/ai/parsers/promotion-response.parser';
import { AI_CONFIG } from '@infrastructure/ai/config/ai.constants';

@Injectable()
export class OpenAiPromotionProvider implements PromotionAiProvider {
  private readonly logger = new Logger(OpenAiPromotionProvider.name);
  private readonly parser = new PromotionResponseParser();

  constructor(private readonly openAiClient: OpenAiClientService) {}

  async generatePromotionFromMessage(
    message: string,
  ): Promise<PromotionPayload | null> {
    try {
      this.logger.debug(
        `Extracting promotion from message: ${message.substring(0, 100)}...`,
      );

      const completion = await this.openAiClient.createChatCompletion({
        model: this.openAiClient.defaultPromotionModel,
        temperature: AI_CONFIG.TEMPERATURE.LOW,
        messages: PromotionExtractionPrompt.build(message),
      });

      const rawResponse = completion.choices[0]?.message?.content;
      this.logger.debug(`AI raw response: ${rawResponse}`);

      return this.parser.parse(completion);
    } catch (error) {
      this.logger.error(
        'Failed to generate promotion payload',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }
}
