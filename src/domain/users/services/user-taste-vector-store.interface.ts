import { UserTaste } from '@domain/users/entities/user-taste.entity';

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
  upsert(taste: UserTaste, vector: number[]): Promise<void>;

  delete(taste: UserTaste): Promise<void>;

  findSimilarToVector(
    vector: number[],
    options: UserTasteSimilarityOptions,
  ): Promise<UserTasteVectorMatch[]>;
}
