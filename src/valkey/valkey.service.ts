import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class ValkeyService implements OnModuleDestroy {
  createQueryBuilder(arg0: string) {
    throw new Error('Method not implemented.');
  }
  async hgetall(key: string): Promise<any | null> {
    const data = await this.client.hgetall(key);
    return data && Object.keys(data).length > 0 ? data : null; // 데이터가 있으면 반환, 없으면 null
  }

  findOne(arg0: { where: { user_id: any }; order: { timestamp: string } }) {
    throw new Error('Method not implemented.');
  }
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

  async scan([newCursor, foundKeys, pattern]: [string, string[], string]) {
    const keys = [];
    let cursor = '0';
    await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
  }
  // Redis SCAN을 사용하여 키 목록을 가져오는 함수
  /* async scanKeys(pattern: string, count: number = 100): Promise<string[]> {
    let cursor = '0';
    let keys: string[] = [];

    do {
      const [newCursor, foundKeys]: [string, string[]] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count.toString(), // count 값을 숫자가 아닌 문자열로 전달
      );

      cursor = newCursor;
      if (Array.isArray(foundKeys)) {
        keys = keys.concat(foundKeys);
      }
    } while (cursor !== '0'); // cursor가 0이 되면 종료

    return keys ?? [];
  }

  // Redis에서 해시 데이터 가져오기
  async hgetall(key: string): Promise<any> {
    const data = await this.client.hgetall(key);
    return data ? data : null;
  }*/
  async getKeysByPattern(
    pattern: string,
    count: number = 100,
  ): Promise<string[]> {
    let cursor = '0';
    let keys: string[] = [];

    do {
      const [newCursor, foundKeys]: [string, string[]] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count.toString(),
      );

      cursor = newCursor;
      if (Array.isArray(foundKeys)) {
        keys = keys.concat(foundKeys);
      }
    } while (cursor !== '0');

    return keys;
  }

  onModuleDestroy() {
    this.client.quit();
  }
  // ✅ Pipeline 전용 메서드 추가
  createPipeline() {
    return this.client.pipeline();
  }

  // ✅ 클라이언트 접근을 위한 public 메서드 추가
  getClient(): Redis {
    return this.client;
  }

  // type 메서드 구현
  async type(key: string): Promise<string> {
    return this.client.type(key); // Redis 'type' 명령어 사용
  }

  async getString(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`Redis GET Error: ${error.message}`);
      throw error;
    }
  }

  /*
  async zrange(
    key: string,
    start: number,
    end: number,
    withScores: string,
  ): Promise<any[]> {
    return this.client.zrange(key, start, end, withScores);
  }
  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }*/
}
