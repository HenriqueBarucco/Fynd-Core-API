import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PromotionPayload } from '@domain/promotions/promotion.interface';
import type { MessageSender } from '@domain/messaging/message-sender.interface';
import type { UserTasteVectorMatch } from '@domain/users/services/user-taste-vector-store.interface';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import { MESSAGE_SENDER, USER_REPOSITORY } from '@domain/tokens';
import { PromotionMessageFormatterService } from './promotion-message-formatter.service';
import { File } from '@app/domain/messaging/file.interface';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(MESSAGE_SENDER)
    private readonly messageSender: MessageSender,
    private readonly messageFormatter: PromotionMessageFormatterService,
  ) {}

  async notifyUsers(
    matches: UserTasteVectorMatch[],
    promotion: PromotionPayload,
    image?: File,
  ): Promise<void> {
    if (!matches.length) {
      this.logger.log(`No users to notify for promotion: ${promotion.name}`);
      return;
    }

    const userIds = this.extractUniqueUserIds(matches);
    const users = await this.userRepository.findManyByIds(userIds);

    if (!users.length) {
      this.logger.warn(
        `No users found in database for ${userIds.length} unique IDs`,
      );
      return;
    }

    const userScoreMap = new Map<string, number>();
    for (const match of matches) {
      const currentScore = userScoreMap.get(match.userId);
      if (currentScore === undefined || match.score > currentScore) {
        userScoreMap.set(match.userId, match.score);
      }
    }

    const sendPromises = users.map((user) => {
      const matchScore = userScoreMap.get(user.id);
      const message = this.messageFormatter.format({ promotion, matchScore });
      return this.sendNotification(user.phone, message, promotion.name, image);
    });

    await Promise.allSettled(sendPromises);

    this.logger.log(
      `Dispatched ${users.length} notifications for promotion: ${promotion.name}`,
    );
  }

  private async sendNotification(
    phone: string,
    message: string,
    promotionName: string,
    image?: File,
  ): Promise<void> {
    try {
      await this.messageSender.sendMessage(phone, message, image);
    } catch (error) {
      this.logger.error(
        `Failed to send notification for "${promotionName}" to ${phone}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private extractUniqueUserIds(matches: UserTasteVectorMatch[]): string[] {
    return [...new Set(matches.map((match) => match.userId))];
  }
}
