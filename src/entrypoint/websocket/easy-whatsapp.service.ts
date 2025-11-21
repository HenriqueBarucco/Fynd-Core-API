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

      const textPayload = this.extractTextPayload(message);

      if (!textPayload) {
        this.logger.warn('Ignoring message without textual content');
        return;
      }

      await this.receiveMessageUseCase.execute({
        from: message.group || message.phone,
        message: textPayload,
      });
    } catch (error) {
      this.logger.error(
        'Failed to handle WhatsApp message',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private extractTextPayload(message: Message): string | null {
    if (message.type === 'image') {
      return this.sanitizeText(message.caption);
    }

    return this.sanitizeText(message.message);
  }

  private sanitizeText(rawText?: string): string | null {
    const trimmed = rawText?.trim();
    return trimmed?.length ? trimmed : null;
  }
}
