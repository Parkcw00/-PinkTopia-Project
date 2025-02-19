import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        options: {
          host: configService.get('REDIS_NAME'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USER'),
          password: configService.get('REDIS_PASSWORD'),
        },
        type: 'single',
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RedisModule], // 다른 모듈에서 사용할 수 있도록 내보내기
})
export class CustomRedisModule {}
