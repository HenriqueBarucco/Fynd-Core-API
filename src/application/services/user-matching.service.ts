import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { EmbeddingProvider } from '@domain/ai/embedding.provider';
import type {
  UserTasteVectorStore,
  UserTasteVectorMatch,
} from '@domain/users/services/user-taste-vector-store.interface';
import { EMBEDDING_PROVIDER, USER_TASTE_VECTOR_STORE } from '@domain/tokens';

@Injectable()
export class UserMatchingService {
  private readonly logger = new Logger(UserMatchingService.name);
  private readonly minScore: number;

  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    @Inject(USER_TASTE_VECTOR_STORE)
    private readonly userTasteVectorStore: UserTasteVectorStore,
    private readonly configService: ConfigService,
  ) {
    this.minScore = this.configService.getOrThrow<number>(
      'PROMOTION_MATCH_SCORE_THRESHOLD',
    );
  }

  async findInterestedUsers(
    promotion: PromotionPayload,
  ): Promise<UserTasteVectorMatch[]> {
    const embeddingText = this.buildPromotionEmbeddingText(promotion);

    if (!embeddingText) {
      this.logger.warn(
        'Cannot search for interested users: promotion missing descriptive text',
      );
      return [];
    }

    const embedding = await this.generateEmbedding(embeddingText);
    const matches = await this.searchSimilarUsers(embedding.vector);

    return matches;
  }

  private buildPromotionEmbeddingText(promotion: PromotionPayload): string {
    const parts = [promotion.name, promotion.tags?.join(' '), promotion.type];

    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part && part.length))
      .join(' | ');
  }

  private async generateEmbedding(text: string) {
    const embedding = await this.embeddingProvider.generateEmbedding(text);

    const vectorPreview = embedding.vector
      .slice(0, 5)
      .map((value) =>
        Number.isFinite(value) ? value.toFixed(6) : String(value),
      );

    this.logger.debug(
      `Generated promotion embedding (model=${embedding.model}, vectorLength=${embedding.vector.length}, preview=[${vectorPreview.join(', ')}])`,
    );

    return embedding;
  }

  private async searchSimilarUsers(
    vector: number[],
  ): Promise<UserTasteVectorMatch[]> {
    return this.userTasteVectorStore.findSimilarToVector(vector, {
      scoreThreshold: this.minScore,
    });
  }

  extractUniqueUserIds(matches: UserTasteVectorMatch[]): string[] {
    return [...new Set(matches.map((match) => match.userId))];
  }
}
