import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@app/app.module';
import { createAppLogger } from '@infrastructure/logging/app-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createAppLogger(),
  });
  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fynd Core API')
    .setDescription('HTTP endpoints for the Fynd Core platform.')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);
  const swaggerJsonRoute = `/${globalPrefix}/openapi.json`;
  app.getHttpAdapter().get(swaggerJsonRoute, (_req, res: Response) => {
    res.json(swaggerDocument);
  });
  writeFileSync(
    join(process.cwd(), 'swagger.json'),
    JSON.stringify(swaggerDocument, null, 2),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
