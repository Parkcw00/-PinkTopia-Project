import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class ValkeyService implements OnModuleDestroy {
  pipeline() {
    throw new Error('Method not implemented.');
  }
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
    return data ? JSON.parse(data) : null; // JSON 변환 후 반환
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
  // ✅ 클라이언트 접근을 위한 public 메서드 추가
  getClient(): Redis {
    return this.client;
  }
  // ✅ Pipeline 전용 메서드 추가
  createPipeline() {
    return this.client.pipeline();
  }
}
