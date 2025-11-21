import { UserTaste } from '@domain/users/entities/user-taste.entity';
import type { UserTasteLabelMetadata } from '@domain/users/services/user-taste-label-enhancer.interface';

export interface UserTasteVectorMatch {
  tasteId: string;
  userId: string;
  label: string;
  originalLabel?: string;
  score: number;
}

export interface UserTasteSimilarityOptions {
  scoreThreshold: number;
}

export interface UserTasteVectorStore {
  upsert(
    taste: UserTaste,
    vector: number[],
    metadata: UserTasteLabelMetadata,
  ): Promise<void>;

  delete(taste: UserTaste): Promise<void>;

  findSimilarToVector(
    vector: number[],
    options: UserTasteSimilarityOptions,
  ): Promise<UserTasteVectorMatch[]>;
}
