import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReceiveMessageUseCase } from '@application/use-cases/receive-message.use-case';
import { EasyWhatsApp } from 'easy-whatsapp-lib';
import { Message } from 'easy-whatsapp-lib/lib/cjs/types/message';

@Injectable()
export class EasyWhatsAppService implements OnModuleInit {
  private connection: EasyWhatsApp | null = null;
  private readonly logger = new Logger(EasyWhatsAppService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly receiveMessageUseCase: ReceiveMessageUseCase,
  ) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('EASY_WHATSAPP_KEY');

    if (!apiKey) {
      this.logger.warn(
        'EASY_WHATSAPP_KEY not set, skipping WhatsApp socket bootstrap',
      );
      return;
    }

    this.connection = new EasyWhatsApp(apiKey);
    this.logger.log('EasyWhatsApp connection initialized');

    this.connection.receiveMessage((message) => {
      void this.handleReceivedMessage(message);
    });
  }

  private async handleReceivedMessage(message: Message): Promise<void> {
    try {
      this.logger.log('Received WhatsApp message', message);

      await this.receiveMessageUseCase.execute({
        from: message.group || message.phone,
        message: message.message,
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle WhatsApp message',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
