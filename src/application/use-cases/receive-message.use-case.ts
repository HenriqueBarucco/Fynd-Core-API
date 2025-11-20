import { Inject, Injectable, Logger } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';
import { GROUP_REPOSITORY } from '@app/domain/tokens';
import type { GroupRepository } from '@app/domain/groups/repositories/group.repository';
import { PromotionService } from '@application/services/promotion.service';

export interface ReceiveMessageInput {
  from: string;
  message: string;
}

@Injectable()
export class ReceiveMessageUseCase
  implements UseCase<ReceiveMessageInput, void>
{
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    private readonly promotionService: PromotionService,
  ) {}

  private readonly logger = new Logger(ReceiveMessageUseCase.name);

  async execute({ from, message }: ReceiveMessageInput): Promise<void> {
    this.logger.log(`Received message ${message ?? 'unknown'} from ${from}`);

    const group = await this.groupRepository.findByExternalId(from);

    if (group) {
      const promotion = await this.promotionService.extractPromotion(message);

      if (promotion) {
        // const users = users that may be interested in this promotion
      } else {
        this.logger.log(`No promotion detected for group ${group.id}`);
      }
    } else {
      this.logger.log(`Message is from unknown group ${from}, ignoring`);
    }
  }
}
