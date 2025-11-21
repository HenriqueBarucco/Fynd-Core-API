import { Inject, Injectable, Logger } from '@nestjs/common';
import { EasyWhatsApp } from 'easy-whatsapp-lib';
import { MessageSender } from '@domain/messaging/message-sender.interface';
import { WHATSAPP_CONNECTION } from './whatsapp.connection';

@Injectable()
export class WhatsAppMessageSender implements MessageSender {
  private readonly logger = new Logger(WhatsAppMessageSender.name);

  constructor(
    @Inject(WHATSAPP_CONNECTION)
    private readonly connection: EasyWhatsApp | null,
  ) {}

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.connection) {
      this.logger.warn(
        'WhatsApp connection not available, skipping message send',
      );
      throw new Error('WhatsApp connection not initialized');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await this.connection.sendMessage(to, message);
      this.logger.log(`Sent WhatsApp message to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error instanceof Error
        ? error
        : new Error(`Failed to send WhatsApp message: ${String(error)}`);
    }
  }
}
