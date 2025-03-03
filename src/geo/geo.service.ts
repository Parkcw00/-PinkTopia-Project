import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class GeoService implements OnModuleInit, OnModuleDestroy {
  private readonly S_GEO_KEY = 'bookmarksS'; 
  private readonly P_GEO_KEY = 'bookmarkP'; // Valkey 내 Geo 데이터 키
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(); // Redis 클라이언트 초기화
  }

  /**
   * 모듈이 초기화될 때 실행됩니다.
   */
  onModuleInit() {
    // 필요 시 초기화 로직 추가
  }

  /**
   * 모듈이 종료될 때 실행됩니다.
   */
  onModuleDestroy() {
    this.client.quit(); // Redis 연결 종료
  }

  /**
   * Redis에 여러 작업을 일괄 처리하는 파이프라인 생성
   */
  multi() {
    return this.client.multi(); // multi()는 Redis의 파이프라인 메서드
  }


  /**
   * Redis Geo 데이터에 위치 정보를 추가하고, 추가 속성은 Hash에 저장
   * @param key Redis 키
   * @param data 북마크 데이터 객체
   */
  async geoAddBookmarkS(
    key: string,
    data: {
      id: number;
      achievement_id: number;
      title: string;
      content: string;
      longitude: number;
      latitude: number;
      sub_achievement_images: string[];
      mission_type: string;
      expiration_at: string | "";
      created_at: string | "";
      updated_at: string | "";
    }
  ) {
    const member = data.id.toString(); // 멤버는 고유 식별자로 사용 (문자열 필요)
    // GEO에 위치 데이터 저장
    await this.client.geoadd(key, data.longitude, data.latitude, member);
    // Hash에 추가 속성 저장
    const hashKey = `bookmarkS:${data.id}`;
    await this.client.hset(hashKey, {
      achievement_id: data.achievement_id,
      title: data.title,
      content: data.content,
      sub_achievement_images: data.sub_achievement_images,
      mission_type: data.mission_type,
      expiration_at: data.expiration_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }

  /**
   * Redis Geo 데이터에 항목 추가 (간단한 위치 데이터 사용)
   * @param key Redis 키
   * @param longitude 경도
   * @param latitude 위도
   * @param member 멤버
   */
  // 핑크몽 위치 수정하기
  async geoAddBookmarkP(key: string, longitude: number, latitude: number, member: string) {
    await this.client.geoadd(key, longitude, latitude, member);
  }





/**
   * 반경 5m 이내 북마크 검색 및 상세 정보 반환
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @returns 반경 내 북마크 상세 정보 목록
   */
async getNearbyBookmarksS(latitude: number, longitude: number): Promise<any[]> {
  // 1. GEO에서 반경 5m 내의 북마크 ID 목록 가져오기
  const nearbyIds = await this.client.georadius(this.S_GEO_KEY, longitude, latitude, 5, 'm') as string[];
  // 2. ID 목록을 기반으로 Hash에서 상세 정보 가져오기
  const bookmarkDetails = await Promise.all(
    nearbyIds.map(async (id) => {
      const hashKey = `bookmarkS:${id}`;
      const details = await this.client.hgetall(hashKey);
      return { id, ...details }; // ID와 상세 정보를 함께 반환
    })
  );

  return bookmarkDetails;
}

/**
   * 반경 5m 이내 북마크 검색 및 상세 정보 반환
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @returns 반경 내 북마크 상세 정보 목록
   */
async getNearbyBookmarkP(latitude: number, longitude: number): Promise<any[]> {
  // 1. GEO에서 반경 5m 내의 북마크 ID 목록 가져오기
  const nearbyIds = await this.client.georadius(this.P_GEO_KEY, longitude, latitude, 5, 'm') as string[];

  // 2. ID 목록을 기반으로 Hash에서 상세 정보 가져오기
  const bookmarkDetails = await Promise.all(
    nearbyIds.map(async (id) => {
      const hashKey = `bookmarkP:${id}`;
      const details = await this.client.hgetall(hashKey);
      return { id, ...details }; // ID와 상세 정보를 함께 반환
    })
  );

  return bookmarkDetails;
}
}
