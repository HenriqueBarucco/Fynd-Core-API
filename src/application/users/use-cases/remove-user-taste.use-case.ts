import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';
import { USER_TASTE_REPOSITORY, USER_TASTE_VECTOR_STORE } from '@domain/tokens';
import type { UserTasteRepository } from '@domain/users/repositories/user-taste.repository';
import type { UserTasteVectorStore } from '@domain/users/services/user-taste-vector-store.interface';

export interface RemoveUserTasteInput {
  userId: string;
  tasteId: string;
}

@Injectable()
export class RemoveUserTasteUseCase
  implements UseCase<RemoveUserTasteInput, boolean>
{
  constructor(
    @Inject(USER_TASTE_REPOSITORY)
    private readonly userTasteRepository: UserTasteRepository,
    @Inject(USER_TASTE_VECTOR_STORE)
    private readonly vectorStore: UserTasteVectorStore,
  ) {}

  async execute({ userId, tasteId }: RemoveUserTasteInput): Promise<boolean> {
    const taste = await this.userTasteRepository.findById(tasteId);

    if (!taste || taste.userId !== userId) {
      return false;
    }

    await this.vectorStore.delete(taste);
    await this.userTasteRepository.delete(taste);

    return true;
  }
}
