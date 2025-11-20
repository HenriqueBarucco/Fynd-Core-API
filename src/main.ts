import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { createAppLogger } from '@infrastructure/logging/app-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createAppLogger(),
  });
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
