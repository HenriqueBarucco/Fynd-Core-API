import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { EasyWhatsAppService } from '@entrypoint/websocket/easy-whatsapp.service';

@Module({
  imports: [ApplicationModule],
  providers: [EasyWhatsAppService],
  exports: [EasyWhatsAppService],
})
export class WebsocketModule {}
