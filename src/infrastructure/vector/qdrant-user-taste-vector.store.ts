import { Injectable, Logger } from '@nestjs/common';
import type {
  UserTasteSimilarityOptions,
  UserTasteVectorMatch,
  UserTasteVectorStore,
} from '@domain/users/services/user-taste-vector-store.interface';
import type { UserTaste } from '@domain/users/entities/user-taste.entity';
import type { UserTasteLabelMetadata } from '@domain/users/services/user-taste-label-enhancer.interface';
import {
  QdrantService,
  type QdrantScoredPoint,
} from '@infrastructure/vector/qdrant.service';

@Injectable()
export class QdrantUserTasteVectorStore implements UserTasteVectorStore {
  constructor(private readonly qdrantService: QdrantService) {}
  private readonly logger = new Logger(QdrantUserTasteVectorStore.name);
  private readonly searchBatchSize = 128; // Qdrant search requires paging even when using score threshold

  async upsert(
    taste: UserTaste,
    vector: number[],
    metadata: UserTasteLabelMetadata,
  ): Promise<void> {
    try {
      await this.qdrantService.upsert([
        {
          id: taste.qdrantPointId,
          vector,
          payload: {
            tasteId: taste.id,
            userId: taste.userId,
            label: metadata.searchLabel,
            originalLabel: metadata.originalLabel,
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

  async findSimilarToVector(
    vector: number[],
    options: UserTasteSimilarityOptions,
  ): Promise<UserTasteVectorMatch[]> {
    this.logger.debug(
      `Searching Qdrant for similar tastes (threshold=${options.scoreThreshold}, vectorLength=${vector.length})`,
    );
    const matches: UserTasteVectorMatch[] = [];
    let offset = 0;

    while (true) {
      const points = await this.qdrantService.search({
        vector,
        limit: this.searchBatchSize,
        offset,
        scoreThreshold: options.scoreThreshold,
      });

      this.logger.debug(
        `Qdrant returned ${points.length} points for offset ${offset}`,
      );

      if (points.length) {
        const sample = points.slice(0, 5).map((point) => ({
          id: point.id,
          score: point.score,
          payload: point.payload,
        }));

        this.logger.verbose(`Sample Qdrant points: ${JSON.stringify(sample)}`);
      }

      if (!points.length) {
        break;
      }

      for (const point of points) {
        const match = this.mapPointToMatch(point);
        if (match) {
          matches.push(match);
        }
      }

      if (points.length < this.searchBatchSize) {
        break;
      }

      offset += this.searchBatchSize;
    }

    this.logger.debug(
      `Total matches aggregated from Qdrant: ${matches.length}`,
    );
    return matches;
  }

  private mapPointToMatch(
    point: QdrantScoredPoint,
  ): UserTasteVectorMatch | null {
    const payload = point.payload ?? {};
    const tasteId = payload['tasteId'];
    const userId = payload['userId'];
    const label = payload['label'];
    const originalLabel = payload['originalLabel'];

    if (typeof tasteId !== 'string' || typeof userId !== 'string') {
      this.logger.warn('Ignoring Qdrant point missing identifiers', payload);
      return null;
    }

    return {
      tasteId,
      userId,
      label: typeof label === 'string' ? label : '',
      originalLabel:
        typeof originalLabel === 'string' ? originalLabel : undefined,
      score: point.score ?? 0,
    } satisfies UserTasteVectorMatch;
  }
}
