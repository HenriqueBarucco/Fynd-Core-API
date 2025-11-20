import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@entrypoint/http/http.module';
import { WebsocketModule } from '@entrypoint/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    WebsocketModule,
  ],
})
export class AppModule {}
