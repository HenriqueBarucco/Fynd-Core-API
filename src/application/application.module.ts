import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { CreateUserUseCase } from '@application/users/use-cases/create-user.use-case';
import { GetUsersUseCase } from '@application/users/use-cases/get-users.use-case';
import { GetUserUseCase } from '@application/users/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '@application/users/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@application/users/use-cases/delete-user.use-case';
import { CreateGroupUseCase } from '@application/groups/use-cases/create-group.use-case';
import { GetGroupsUseCase } from '@application/groups/use-cases/get-groups.use-case';
import { GetGroupUseCase } from '@application/groups/use-cases/get-group.use-case';
import { UpdateGroupUseCase } from '@application/groups/use-cases/update-group.use-case';
import { DeleteGroupUseCase } from '@application/groups/use-cases/delete-group.use-case';
import { ReceiveMessageUseCase } from '@application/use-cases/receive-message.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    CreateGroupUseCase,
    GetGroupsUseCase,
    GetGroupUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    ReceiveMessageUseCase,
  ],
  exports: [
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    CreateGroupUseCase,
    GetGroupsUseCase,
    GetGroupUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    ReceiveMessageUseCase,
  ],
})
export class ApplicationModule {}
