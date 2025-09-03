import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '30mb' }));
  
  // ✅ AUMENTAR LÍMITE PARA URL-ENCODED (30MB)
  app.use(urlencoded({ extended: true, limit: '30mb' }))
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
  });
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
