import { UserTaste } from '@domain/users/entities/user-taste.entity';

export interface UserTasteRepository {
  save(taste: UserTaste): Promise<UserTaste>;
  findById(id: string): Promise<UserTaste | null>;
  findManyByUserId(userId: string): Promise<UserTaste[]>;
  findByUserAndLabel(
    userId: string,
    normalizedLabel: string,
  ): Promise<UserTaste | null>;
  delete(taste: UserTaste): Promise<void>;
}
