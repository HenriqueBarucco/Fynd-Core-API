import { Module } from '@nestjs/common';
import {
  EMBEDDING_PROVIDER,
  GROUP_REPOSITORY,
  PROMOTION_AI_PROVIDER,
  USER_REPOSITORY,
  USER_TASTE_REPOSITORY,
  USER_TASTE_VECTOR_STORE,
} from '@domain/tokens';
import { DrizzleModule } from '@infrastructure/persistence/drizzle/drizzle.module';
import { DrizzleUserRepository } from '@infrastructure/persistence/drizzle/user.repository';
import { DrizzleGroupRepository } from '@infrastructure/persistence/drizzle/group.repository';
import { OpenAiPromotionProvider } from '@infrastructure/ai/openai-promotion.provider';
import { DrizzleUserTasteRepository } from '@infrastructure/persistence/drizzle/user-taste.repository';
import { QdrantService } from '@infrastructure/vector/qdrant.service';
import { QdrantUserTasteVectorStore } from '@infrastructure/vector/qdrant-user-taste-vector.store';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';
import { OpenAiEmbeddingProvider } from '@infrastructure/ai/openai-embedding.provider';
import { WhatsAppModule } from '@infrastructure/whatsapp/whatsapp.module';

@Module({
  imports: [DrizzleModule, WhatsAppModule],
  providers: [
    DrizzleUserRepository,
    DrizzleGroupRepository,
    DrizzleUserTasteRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useExisting: DrizzleGroupRepository,
    },
    {
      provide: USER_TASTE_REPOSITORY,
      useExisting: DrizzleUserTasteRepository,
    },
    QdrantService,
    QdrantUserTasteVectorStore,
    {
      provide: USER_TASTE_VECTOR_STORE,
      useExisting: QdrantUserTasteVectorStore,
    },
    OpenAiClientService,
    OpenAiPromotionProvider,
    OpenAiEmbeddingProvider,
    {
      provide: PROMOTION_AI_PROVIDER,
      useExisting: OpenAiPromotionProvider,
    },
    {
      provide: EMBEDDING_PROVIDER,
      useExisting: OpenAiEmbeddingProvider,
    },
  ],
  exports: [
    USER_REPOSITORY,
    GROUP_REPOSITORY,
    USER_TASTE_REPOSITORY,
    USER_TASTE_VECTOR_STORE,
    PROMOTION_AI_PROVIDER,
    EMBEDDING_PROVIDER,
    WhatsAppModule,
  ],
})
export class InfrastructureModule {}
