import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { UserController } from '@entrypoint/http/controllers/user.controller';
import { GroupController } from '@entrypoint/http/controllers/group.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, GroupController],
})
export class HttpModule {}
