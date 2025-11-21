import { Injectable, Logger } from '@nestjs/common';
import type { EmbeddingProvider } from '@domain/ai/embedding.provider';
import type { EmbeddingResult } from '@domain/ai/embedding.provider';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';

@Injectable()
export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  private readonly logger = new Logger(OpenAiEmbeddingProvider.name);

  constructor(private readonly client: OpenAiClientService) {}

  async generateEmbedding(input: string): Promise<EmbeddingResult> {
    const cleaned = input.trim();

    if (!cleaned.length) {
      throw new Error('Cannot build embedding from empty text');
    }

    const embedding = await this.client.createEmbedding({
      input: cleaned,
      model: this.client.defaultEmbeddingModel,
    });

    if (!embedding.vector?.length) {
      this.logger.warn('Embedding vector came back empty');
      throw new Error('Embedding vector is empty');
    }

    if (embedding.vector.every((val) => val === 0)) {
      this.logger.warn('Embedding vector is all zeros');
      throw new Error('Embedding vector is all zeros');
    }

    return {
      vector: embedding.vector,
      model: embedding.model,
    };
  }
}
