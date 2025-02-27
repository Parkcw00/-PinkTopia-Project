import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  //위치추적 허용
  // const httpsOptions = {
  // key: readFileSync('server.key'),
  // cert: readFileSync('server.cert'),
  // };
  const app = await NestFactory.create(AppModule); //, { httpsOptions });
  // ✅ CORS 활성화 (모든 요청 허용)
  app.enableCors();
  app.use(cookieParser());
  // 정적 파일 제공 설정
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });

  app.use(cookieParser());

  app.use((req, res, next) => {
    res.cookie('your-cookie-name', 'your-cookie-value', {
      httpOnly: true,
      secure: true, // HTTPS 환경에서만 사용 가능
      sameSite: 'none', // ✅ 서드파티 쿠키 허용
    });
    next();
  });
  // 정적 파일 제공 설정
  app.use('/public', express.static(join(__dirname, '..', 'public')));
  const options = new DocumentBuilder()
    .setTitle('Your API Title')
    .addBearerAuth()
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer(
      process.env.BASE_URL || 'http://localhost:3000/',
      'Local environment',
    )
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addBearerAuth()
    .addTag('Your API Tag')
    .addBearerAuth() // JWT 베어러 인증 추가
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
