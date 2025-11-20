import { Module } from '@nestjs/common';
import { EasyWhatsAppService } from '@entrypoint/websocket/easy-whatsapp.service';

@Module({
  providers: [EasyWhatsAppService],
  exports: [EasyWhatsAppService],
})
export class WebsocketModule {}
