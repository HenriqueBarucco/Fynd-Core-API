import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [GetUserUseCase],
  exports: [GetUserUseCase],
})
export class ApplicationModule {}
