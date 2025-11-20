import { Injectable, Logger } from '@nestjs/common';
import type { UserTasteVectorStore } from '@domain/users/services/user-taste-vector-store.interface';
import type { UserTaste } from '@domain/users/entities/user-taste.entity';
import { QdrantService } from '@infrastructure/vector/qdrant.service';

@Injectable()
export class QdrantUserTasteVectorStore implements UserTasteVectorStore {
  constructor(private readonly qdrantService: QdrantService) {}
  private readonly logger = new Logger(QdrantUserTasteVectorStore.name);

  async upsert(taste: UserTaste, vector: number[]): Promise<void> {
    try {
      await this.qdrantService.upsert([
        {
          id: taste.qdrantPointId,
          vector,
          payload: {
            tasteId: taste.id,
            userId: taste.userId,
            label: taste.label,
            embeddingModel: taste.embeddingModel,
          },
        },
      ]);
    } catch (error) {
      this.logger.error('Error upserting user taste vector to Qdrant:', error);
      throw error;
    }
  }

  async delete(taste: UserTaste): Promise<void> {
    await this.qdrantService.delete([taste.qdrantPointId]);
  }
}
