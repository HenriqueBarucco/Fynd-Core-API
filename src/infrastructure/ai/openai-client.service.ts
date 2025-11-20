import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { OpenAI as OpenAIClient } from 'openai';
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources/chat/completions';
import type { EmbeddingCreateParams } from 'openai/resources/embeddings';

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
    const apiKey =
      this.configService.get<string>('LM_STUDIO_API_KEY') ?? 'lm-studio';
    const baseURL =
      this.configService.get<string>('LM_STUDIO_BASE_URL') ??
      'http://localhost:1234/v1';

    this.promotionModel =
      this.configService.get<string>('LM_STUDIO_PROMOTION_MODEL') ??
      this.configService.get<string>('LM_STUDIO_MODEL') ??
      'gpt-4o-mini';

    this.embeddingModel =
      this.configService.get<string>('LM_STUDIO_EMBEDDING_MODEL') ??
      'text-embedding-3-small';

    this.client = new OpenAI({ apiKey, baseURL });
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
}
