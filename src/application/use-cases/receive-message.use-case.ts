import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UseCase } from '@application/contracts/use-case.interface';
import {
  EMBEDDING_PROVIDER,
  GROUP_REPOSITORY,
  USER_TASTE_VECTOR_STORE,
} from '@app/domain/tokens';
import type { GroupRepository } from '@app/domain/groups/repositories/group.repository';
import { PromotionService } from '@application/services/promotion.service';
import type { PromotionPayload } from '@app/domain/promotions/promotion.interface';
import type { EmbeddingProvider } from '@domain/ai/embedding.provider';
import type {
  UserTasteVectorStore,
  UserTasteVectorMatch,
} from '@domain/users/services/user-taste-vector-store.interface';

export interface ReceiveMessageInput {
  from: string;
  message: string;
}

@Injectable()
export class ReceiveMessageUseCase
  implements UseCase<ReceiveMessageInput, void>
{
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    private readonly promotionService: PromotionService,
    @Inject(USER_TASTE_VECTOR_STORE)
    private readonly userTasteVectorStore: UserTasteVectorStore,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly configService: ConfigService,
  ) {
    this.minScore = this.configService.getOrThrow<number>(
      'PROMOTION_MATCH_SCORE_THRESHOLD',
    );
  }

  private readonly logger = new Logger(ReceiveMessageUseCase.name);
  private readonly minScore: number;

  async execute({ from, message }: ReceiveMessageInput): Promise<void> {
    this.logger.log(`Received message ${message ?? 'unknown'} from ${from}`);

    const group = await this.groupRepository.findByExternalId(from);

    if (group) {
      const promotion = await this.promotionService.extractPromotion(message);

      if (promotion) {
        this.logger.log(
          `Detected promotion ${promotion.name} in message from group ${group.id} (${promotion.tags.join(', ')}) - ${promotion.type}`,
        );
        const interestedUsers = await this.findInterestedUsers(promotion);

        if (!interestedUsers.length) {
          this.logger.log(
            `No users matched promotion ${promotion.name} for group ${group.id}`,
          );
        } else {
          this.logger.log(
            `Found ${interestedUsers.length} interested users for promotion ${promotion.name}`,
          );
        }
      } else {
        this.logger.log(`No promotion detected for group ${group.id}`);
      }
    } else {
      this.logger.log(`Message is from unknown group ${from}, ignoring`);
    }
  }

  private async findInterestedUsers(
    promotion: PromotionPayload,
  ): Promise<UserTasteVectorMatch[]> {
    const embeddingText = this.buildPromotionEmbeddingText(promotion);

    if (!embeddingText.length) {
      this.logger.warn(
        'Skipping search for promotion missing descriptive text',
      );
      return [];
    }

    const embedding =
      await this.embeddingProvider.generateEmbedding(embeddingText);

    const vectorPreview = embedding.vector
      .slice(0, 5)
      .map((value) =>
        Number.isFinite(value) ? value.toFixed(6) : String(value),
      );
    this.logger.debug(
      `Generated promotion embedding (model=${embedding.model}, vectorLength=${embedding.vector.length}, preview=[${vectorPreview.join(', ')}])`,
    );

    const matches = await this.userTasteVectorStore.findSimilarToVector(
      embedding.vector,
      {
        scoreThreshold: this.minScore,
      },
    );

    return matches;
  }

  private buildPromotionEmbeddingText(promotion: PromotionPayload): string {
    const parts = [promotion.name, promotion.tags?.join(' '), promotion.type];

    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part && part.length))
      .join(' | ');
  }
}
