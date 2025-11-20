import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';
import { ReceiveMessageUseCase } from '@application/use-cases/receive-message.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [GetUserUseCase, ReceiveMessageUseCase],
  exports: [GetUserUseCase, ReceiveMessageUseCase],
})
export class ApplicationModule {}
