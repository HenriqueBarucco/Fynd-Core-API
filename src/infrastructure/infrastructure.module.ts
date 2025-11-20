import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import { InMemoryUserRepository } from '@infrastructure/persistence/in-memory/in-memory-user.repository';

@Module({
  providers: [
    InMemoryUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: InMemoryUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class InfrastructureModule {}
