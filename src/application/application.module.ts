import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { CreateUserUseCase } from '@application/users/use-cases/create-user.use-case';
import { GetUsersUseCase } from '@application/users/use-cases/get-users.use-case';
import { GetUserUseCase } from '@application/users/use-cases/get-user.use-case';
import { GetUserTastesUseCase } from '@application/users/use-cases/get-user-tastes.use-case';
import { UpdateUserUseCase } from '@application/users/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@application/users/use-cases/delete-user.use-case';
import { CreateGroupUseCase } from '@application/groups/use-cases/create-group.use-case';
import { GetGroupsUseCase } from '@application/groups/use-cases/get-groups.use-case';
import { GetGroupUseCase } from '@application/groups/use-cases/get-group.use-case';
import { UpdateGroupUseCase } from '@application/groups/use-cases/update-group.use-case';
import { DeleteGroupUseCase } from '@application/groups/use-cases/delete-group.use-case';
import { ReceiveMessageUseCase } from '@application/use-cases/receive-message.use-case';
import { PromotionService } from '@application/services/promotion.service';
import { PromotionMessageFormatterService } from '@application/services/promotion-message-formatter.service';
import { UserMatchingService } from '@application/services/user-matching.service';
import { NotificationDispatcherService } from '@application/services/notification-dispatcher.service';
import { AddUserTasteUseCase } from '@application/users/use-cases/add-user-taste.use-case';
import { RemoveUserTasteUseCase } from '@application/users/use-cases/remove-user-taste.use-case';
import { SearchUsersByTasteUseCase } from '@application/users/use-cases/search-users-by-taste.use-case';
import { HealthCheckService } from '@application/services/health-check.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    GetUserTastesUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    CreateGroupUseCase,
    GetGroupsUseCase,
    GetGroupUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    PromotionService,
    PromotionMessageFormatterService,
    UserMatchingService,
    NotificationDispatcherService,
    ReceiveMessageUseCase,
    AddUserTasteUseCase,
    RemoveUserTasteUseCase,
    SearchUsersByTasteUseCase,
    HealthCheckService,
  ],
  exports: [
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    GetUserTastesUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    CreateGroupUseCase,
    GetGroupsUseCase,
    GetGroupUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    PromotionService,
    ReceiveMessageUseCase,
    AddUserTasteUseCase,
    RemoveUserTasteUseCase,
    SearchUsersByTasteUseCase,
    HealthCheckService,
  ],
})
export class ApplicationModule {}
