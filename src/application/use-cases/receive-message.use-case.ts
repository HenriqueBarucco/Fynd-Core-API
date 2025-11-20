import { Injectable, Logger } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface ReceiveMessageInput {
  from: string;
  message: string;
}

@Injectable()
export class ReceiveMessageUseCase
  implements UseCase<ReceiveMessageInput, void>
{
  private readonly logger = new Logger(ReceiveMessageUseCase.name);

  async execute({ from, message }: ReceiveMessageInput): Promise<void> {
    this.logger.log(`Received message ${message ?? 'unknown'} from ${from}`);
  }
}
