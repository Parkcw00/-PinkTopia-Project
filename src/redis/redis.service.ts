import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: any, expiryInSeconds?: number) {
    await this.redis.set(key, JSON.stringify(value));
    if (expiryInSeconds) {
      await this.redis.expire(key, expiryInSeconds); // 만료 시간 설정
    }
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    if (value === null) {
      return null; // 값이 없을 경우 null 반환
    }
    return JSON.parse(value); // JSON.parse를 호출하기 전에 null 체크
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
