import { Inject, Injectable, Logger } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';
import { GROUP_REPOSITORY } from '@app/domain/tokens';
import type { GroupRepository } from '@app/domain/groups/repositories/group.repository';
import { PromotionService } from '@application/services/promotion.service';
import { UserMatchingService } from '@application/services/user-matching.service';
import { NotificationDispatcherService } from '@application/services/notification-dispatcher.service';
import { File } from '@app/domain/messaging/file.interface';

export interface ReceiveMessageInput {
  from: string;
  message: string;
  image?: File;
}

@Injectable()
export class ReceiveMessageUseCase
  implements UseCase<ReceiveMessageInput, void>
{
  private readonly logger = new Logger(ReceiveMessageUseCase.name);

  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    private readonly promotionService: PromotionService,
    private readonly userMatchingService: UserMatchingService,
    private readonly notificationDispatcher: NotificationDispatcherService,
  ) {}

  async execute({ from, message, image }: ReceiveMessageInput): Promise<void> {
    this.logger.log(`Received message from ${from}`);

    const group = await this.groupRepository.findByExternalId(from);
    if (!group) {
      this.logger.log(`Ignoring message from unregistered group: ${from}`);
      return;
    }

    const promotion = await this.promotionService.extractPromotion(message);
    if (!promotion) {
      this.logger.log(
        `No promotion detected in group ${group.id} (${group.description})`,
      );
      return;
    }

    this.logger.log(
      `Detected promotion "${promotion.name}" (${promotion.type}) with tags: ${promotion.tags.join(', ')} - ${group.description}`,
    );

    const interestedUsers =
      await this.userMatchingService.findInterestedUsers(promotion);

    if (!interestedUsers.length) {
      this.logger.log(
        `No interested users found for promotion: ${promotion.name}`,
      );
      return;
    }

    this.logger.log(
      `Found ${interestedUsers.length} interested users for promotion: ${promotion.name}`,
    );

    await this.notificationDispatcher.notifyUsers(
      interestedUsers,
      promotion,
      image,
    );
  }
}
