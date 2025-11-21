import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';
import {
  EMBEDDING_PROVIDER,
  USER_REPOSITORY,
  USER_TASTE_REPOSITORY,
  USER_TASTE_VECTOR_STORE,
} from '@domain/tokens';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UserTasteRepository } from '@domain/users/repositories/user-taste.repository';
import type { UserTasteVectorStore } from '@domain/users/services/user-taste-vector-store.interface';
import type { EmbeddingProvider } from '@domain/ai/embedding.provider';
import { UserTaste } from '@domain/users/entities/user-taste.entity';

export interface AddUserTasteInput {
  userId: string;
  label: string;
}

@Injectable()
export class AddUserTasteUseCase
  implements UseCase<AddUserTasteInput, UserTaste | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_TASTE_REPOSITORY)
    private readonly userTasteRepository: UserTasteRepository,
    @Inject(USER_TASTE_VECTOR_STORE)
    private readonly vectorStore: UserTasteVectorStore,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async execute({
    userId,
    label,
  }: AddUserTasteInput): Promise<UserTaste | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    const cleanedLabel = label.trim();
    const normalized = UserTaste.normalizeLabel(cleanedLabel);
    const existing = await this.userTasteRepository.findByUserAndLabel(
      userId,
      normalized,
    );

    const embedding =
      await this.embeddingProvider.generateEmbedding(cleanedLabel);

    const taste = existing
      ? existing
      : UserTaste.create({
          userId,
          label: cleanedLabel,
          embeddingModel: embedding.model,
        });

    if (existing) {
      existing.updateLabel(cleanedLabel);
      existing.updateEmbeddingModel(embedding.model);
    }

    await this.userTasteRepository.save(taste);
    await this.vectorStore.upsert(taste, embedding.vector);

    return taste;
  }
}
