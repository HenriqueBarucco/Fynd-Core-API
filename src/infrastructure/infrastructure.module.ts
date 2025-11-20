import { Module } from '@nestjs/common';
import {
  GROUP_REPOSITORY,
  PROMOTION_AI_PROVIDER,
  USER_REPOSITORY,
} from '@domain/tokens';
import { DrizzleModule } from '@infrastructure/persistence/drizzle/drizzle.module';
import { DrizzleUserRepository } from '@infrastructure/persistence/drizzle/user.repository';
import { DrizzleGroupRepository } from '@infrastructure/persistence/drizzle/group.repository';
import { OpenAiPromotionProvider } from '@infrastructure/ai/openai-promotion.provider';

@Module({
  imports: [DrizzleModule],
  providers: [
    DrizzleUserRepository,
    DrizzleGroupRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useExisting: DrizzleGroupRepository,
    },
    OpenAiPromotionProvider,
    {
      provide: PROMOTION_AI_PROVIDER,
      useExisting: OpenAiPromotionProvider,
    },
  ],
  exports: [USER_REPOSITORY, GROUP_REPOSITORY, PROMOTION_AI_PROVIDER],
})
export class InfrastructureModule {}
