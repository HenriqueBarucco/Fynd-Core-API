import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { OpenAI as OpenAIClient } from 'openai';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources/chat/completions';
import type { EmbeddingCreateParams } from 'openai/resources/embeddings';
import { AI_CONFIG } from './config/ai.constants';

export interface GeneratedEmbedding {
  vector: number[];
  model: string;
}

@Injectable()
export class OpenAiClientService {
  private readonly logger = new Logger(OpenAiClientService.name);
  private readonly client: OpenAIClient;
  private readonly promotionModel: string;
  private readonly embeddingModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('LM_STUDIO_API_KEY');
    const baseURL = this.configService.getOrThrow<string>('LM_STUDIO_BASE_URL');
    const defaultModel =
      this.configService.getOrThrow<string>('LM_STUDIO_MODEL');

    this.promotionModel =
      this.configService.get<string>('LM_STUDIO_PROMOTION_MODEL') ??
      defaultModel;

    this.embeddingModel = this.configService.getOrThrow<string>(
      'LM_STUDIO_EMBEDDING_MODEL',
    );

    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout: AI_CONFIG.TIMEOUT,
    });
  }

  get defaultPromotionModel(): string {
    return this.promotionModel;
  }

  get defaultEmbeddingModel(): string {
    return this.embeddingModel;
  }

  async createChatCompletion(
    params: ChatCompletionCreateParamsNonStreaming,
  ): Promise<ChatCompletion> {
    const payload: ChatCompletionCreateParamsNonStreaming = {
      ...params,
      model: params.model ?? this.promotionModel,
    };

    try {
      return (await this.client.chat.completions.create(
        payload,
      )) as ChatCompletion;
    } catch (error) {
      this.logger.error(
        'Failed to call OpenAI chat completion endpoint',
        error,
      );
      throw error;
    }
  }

  async createEmbedding(
    params: EmbeddingCreateParams,
  ): Promise<GeneratedEmbedding> {
    const payload: EmbeddingCreateParams = {
      ...params,
      input: params.input,
      model: params.model ?? this.embeddingModel,
      encoding_format: 'float',
    };

    try {
      const response = await this.client.embeddings.create(payload);
      const [embedding] = response.data;

      if (!embedding) {
        throw new Error('OpenAI did not return an embedding vector');
      }

      return {
        vector: embedding.embedding,
        model: response.model ?? payload.model,
      };
    } catch (error) {
      this.logger.error('Failed to call OpenAI embeddings endpoint', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      this.logger.error('OpenAI health check failed', error);
      return false;
    }
  }
}
