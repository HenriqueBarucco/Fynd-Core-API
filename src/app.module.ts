import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@entrypoint/http/http.module';
import { WebsocketModule } from '@entrypoint/websocket/websocket.module';
import { validateEnv } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,

      validate: (config: Record<string, unknown>) => validateEnv(config),
    }),
    HttpModule,
    WebsocketModule,
  ],
})
export class AppModule {}
