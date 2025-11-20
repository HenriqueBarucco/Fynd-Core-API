import { UserTaste } from '@domain/users/entities/user-taste.entity';

export interface UserTasteVectorStore {
  upsert(taste: UserTaste, vector: number[]): Promise<void>;
  delete(taste: UserTaste): Promise<void>;
}
