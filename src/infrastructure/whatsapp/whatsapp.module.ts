import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppConnectionProvider } from './whatsapp.connection';
import { WhatsAppMessageSender } from './whatsapp-message-sender.service';
import { MESSAGE_SENDER } from '@domain/tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    WhatsAppConnectionProvider,
    WhatsAppMessageSender,
    {
      provide: MESSAGE_SENDER,
      useExisting: WhatsAppMessageSender,
    },
  ],
  exports: [WhatsAppConnectionProvider, MESSAGE_SENDER],
})
export class WhatsAppModule {}
