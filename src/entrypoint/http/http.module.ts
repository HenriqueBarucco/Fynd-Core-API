import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { UserController } from '@entrypoint/http/controllers/user.controller';
import { GroupController } from '@entrypoint/http/controllers/group.controller';
import { HealthController } from '@entrypoint/http/controllers/health.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, GroupController, HealthController],
})
export class HttpModule {}
