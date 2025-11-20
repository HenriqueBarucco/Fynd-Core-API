import { Module } from '@nestjs/common';
import { GROUP_REPOSITORY, USER_REPOSITORY } from '@domain/tokens';
import { DrizzleModule } from '@infrastructure/persistence/drizzle/drizzle.module';
import { DrizzleUserRepository } from '@infrastructure/persistence/drizzle/user.repository';
import { DrizzleGroupRepository } from '@infrastructure/persistence/drizzle/group.repository';

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
  ],
  exports: [USER_REPOSITORY, GROUP_REPOSITORY],
})
export class InfrastructureModule {}
