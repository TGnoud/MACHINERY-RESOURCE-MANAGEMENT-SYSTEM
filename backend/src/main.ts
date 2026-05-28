import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultOrigins = [
    'https://machinery-resource-management-syste.vercel.app',
    'http://localhost:3000',
  ];
  const configuredOrigins = [
    ...defaultOrigins,
    ...(process.env.CLIENT_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ];
  const corsOptions: CorsOptions = {
    credentials: true,
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  };

  app.enableCors(corsOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
