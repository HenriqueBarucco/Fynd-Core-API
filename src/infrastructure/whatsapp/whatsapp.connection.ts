import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EasyWhatsApp } from 'easy-whatsapp-lib';

export const WHATSAPP_CONNECTION = Symbol('WHATSAPP_CONNECTION');

export const WhatsAppConnectionProvider: Provider = {
  provide: WHATSAPP_CONNECTION,
  useFactory: (config: ConfigService) => {
    const logger = new Logger('WhatsAppConnection');
    const apiKey = config.getOrThrow<string>('EASY_WHATSAPP_KEY');

    logger.log('Initializing EasyWhatsApp connection');
    return new EasyWhatsApp(apiKey);
  },
  inject: [ConfigService],
};
