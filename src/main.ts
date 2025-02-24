import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import * as https from 'https';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  //위치추적 허용
  const httpsOptions = {
    key: readFileSync('server.key'),
    cert: readFileSync('server.cert'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(cookieParser());
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

  ////위치 허용/////////

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
