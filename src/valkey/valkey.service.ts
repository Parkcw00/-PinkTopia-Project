import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class ValkeyService implements OnModuleDestroy {
  private readonly client: Redis;
  constructor() {
    this.client = new Redis({
      host: 'localhost', // Docker 컨테이너와 같은 네트워크일 경우 'valkey' 사용 가능
      port: 6379,
      password: process.env.VALKEY_PASSWORD || undefined, // 비밀번호 추가
    });
  }
  async set(key: string, value: any, expiryInSeconds?: number) {
    const jsonValue = JSON.stringify(value); // JSON 변환
    if (expiryInSeconds) {
      await this.client.set(key, jsonValue, 'EX', expiryInSeconds);
    } else {
      await this.client.set(key, jsonValue);
    }
  }
  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (data === null) return null; // null 반환 시 JSON.parse() 호출 안 함
    return JSON.parse(data);
  }
  async del(key: string) {
    await this.client.del(key);
  }
  async rpush(key: string, value: string) {
    await this.client.rpush(key, value);
  }
  async llen(key: string): Promise<number> {
    return await this.client.llen(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }
  async lpop(key: string): Promise<any> {
    const result = await this.client.lpop(key);
    return result ? JSON.parse(result) : null; // JSON 문자열을 객체로 변환
  }
  onModuleDestroy() {
    this.client.quit();
  }
}
