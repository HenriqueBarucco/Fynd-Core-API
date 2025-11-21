import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UseCase } from '@application/contracts/use-case.interface';
import {
  EMBEDDING_PROVIDER,
  USER_REPOSITORY,
  USER_TASTE_VECTOR_STORE,
} from '@domain/tokens';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { EmbeddingProvider } from '@domain/ai/embedding.provider';
import type {
  UserTasteVectorMatch,
  UserTasteVectorStore,
} from '@domain/users/services/user-taste-vector-store.interface';
import type { User } from '@domain/users/entities/user.entity';

export interface SearchUsersByTasteInput {
  label: string;
  limit?: number;
  scoreThreshold?: number;
}

export interface UserTasteSearchMatch {
  user: User;
  match: UserTasteVectorMatch;
}

export interface SearchUsersByTasteOutput {
  query: {
    originalLabel: string;
    searchLabel: string;
  };
  matches: UserTasteSearchMatch[];
}

@Injectable()
export class SearchUsersByTasteUseCase
  implements UseCase<SearchUsersByTasteInput, SearchUsersByTasteOutput>
{
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;
  private readonly defaultScoreThreshold: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_TASTE_VECTOR_STORE)
    private readonly vectorStore: UserTasteVectorStore,
    @Inject(EMBEDDING_PROVIDER)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {
    this.defaultScoreThreshold = this.configService.getOrThrow<number>(
      'PROMOTION_MATCH_SCORE_THRESHOLD',
    );
  }

  async execute({
    label,
    limit,
    scoreThreshold,
  }: SearchUsersByTasteInput): Promise<SearchUsersByTasteOutput> {
    const cleanedLabel = label.trim();

    if (!cleanedLabel.length) {
      return {
        query: {
          originalLabel: '',
          searchLabel: '',
        },
        matches: [],
      } satisfies SearchUsersByTasteOutput;
    }

    const embedding =
      await this.embeddingProvider.generateEmbedding(cleanedLabel);

    const matches = await this.vectorStore.findSimilarToVector(
      embedding.vector,
      {
        scoreThreshold: scoreThreshold ?? this.defaultScoreThreshold,
      },
    );

    if (!matches.length) {
      return {
        query: {
          originalLabel: cleanedLabel,
          searchLabel: cleanedLabel,
        },
        matches: [],
      } satisfies SearchUsersByTasteOutput;
    }

    const bestMatchesByUser = new Map<string, UserTasteVectorMatch>();

    for (const match of matches) {
      const current = bestMatchesByUser.get(match.userId);
      if (!current || match.score > current.score) {
        bestMatchesByUser.set(match.userId, match);
      }
    }

    const sortedMatches = Array.from(bestMatchesByUser.values()).sort(
      (a, b) => b.score - a.score,
    );

    const effectiveLimit = this.computeLimit(limit);
    const limitedMatches = sortedMatches.slice(0, effectiveLimit);

    const userIds = limitedMatches.map((match) => match.userId);
    const users = await this.userRepository.findManyByIds(userIds);
    const usersById = new Map(users.map((user) => [user.id, user]));

    const results: UserTasteSearchMatch[] = [];

    for (const match of limitedMatches) {
      const user = usersById.get(match.userId);
      if (!user) {
        continue;
      }

      results.push({
        user,
        match,
      });
    }

    return {
      query: {
        originalLabel: cleanedLabel,
        searchLabel: cleanedLabel,
      },
      matches: results,
    } satisfies SearchUsersByTasteOutput;
  }

  private computeLimit(requested?: number): number {
    if (!requested) {
      return this.defaultLimit;
    }

    if (!Number.isFinite(requested)) {
      return this.defaultLimit;
    }

    return Math.min(this.maxLimit, Math.max(1, Math.floor(requested)));
  }
}
