import { Injectable } from '@nestjs/common';
import { LocationHistory } from './entities/location-history.entity';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';
import { LocationHistoryRepository } from './location-history.repository';
import { ValkeyService } from '../valkey/valkey.service';

/**
 * 위치 기록 관리 서비스
 *
 * 주요 기능:
 * 1. 사용자별 위치 기록 생성 및 관리
 * 2. Redis를 사용한 실시간 위치 데이터 캐싱
 * 3. 주기적인 데이터베이스 동기화
 * 4. 최근 7개의 위치 기록 유지
 */
@Injectable()
export class LocationHistoryService {
  constructor(
    private readonly repository: LocationHistoryRepository,
    private readonly valkeyService: ValkeyService, // Redis 캐시 서비스
  ) {}

  /**
   * 회원가입 시 기본 위치 데이터 생성
   *
   * 기능:
   * - 새로운 사용자를 위한 7개의 기본 위치 레코드 생성
   * - Redis와 DB 모두에 데이터 저장
   * - 사용자별 독립적인 위치 기록 관리
   *
   * @param user_id 사용자 ID
   * @returns 생성된 위치 기록 배열
   */
  async createDefault(user_id: number): Promise<LocationHistory[]> {
    const defaultRecords: LocationHistory[] = [];
    // 7개의 기본 위치 데이터 생성
    for (let i = 0; i < 7; i++) {
      const record = await this.repository.create7(user_id);
      defaultRecords.push(record);
    }
    // Redis에 데이터 저장
    await this.valkeyService.del(`LocationHistory:${user_id}`);
    await this.valkeyService.set(`LocationHistory:${user_id}`, defaultRecords);
    console.log(`✅ [Service] Valkey에도 기본 위치 데이터 7개 저장 완료`);

    return defaultRecords;
  }

  /**
   * 실시간 위치 데이터 업데이트 (10초마다 실행)
   *
   * 기능:
   * - Redis 캐시의 위치 데이터 업데이트
   * - 최대 7개의 최근 위치 기록 유지
   * - FIFO(First In First Out) 방식의 데이터 관리
   *
   * 데이터 처리:
   * 1. 기록이 없을 때: 새로운 기록 생성
   * 2. 7개 미만일 때: 새 기록 추가
   * 3. 7개 이상일 때: 가장 오래된 기록 제거 후 새 기록 추가
   *
   * @param user_id 사용자 ID
   * @param updateDto 새로운 위치 정보
   */
  async updateValkey(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<void> {
    console.log(`✅ [Service] updateValkey() 실행 - user_id: ${user_id}`);

    let records: UpdateLocationHistoryDto[] = [];
    try {
      // Redis에서 기존 데이터 조회
      let rawData = await this.valkeyService.get(`LocationHistory:${user_id}`);
      if (typeof rawData === 'string') {
        rawData = JSON.parse(rawData);
      }
      // 데이터 파싱 및 정규화
      records = Array.isArray(rawData)
        ? rawData.map((item) => {
            const parsedItem =
              typeof item === 'string' ? JSON.parse(item) : item;
            return {
              longitude: parsedItem.longitude,
              latitude: parsedItem.latitude, // ✅ userId를 제외
              timestamp:
                parsedItem.timestamp &&
                !isNaN(new Date(parsedItem.timestamp).getTime())
                  ? new Date(parsedItem.timestamp)
                  : new Date(),
            };
          })
        : [];
    } catch (error) {
      console.error(`❌ [Service] Valkey 데이터 파싱 오류:`, error);
      records = [];
    }

    // 위치 기록 관리 로직
    if (records.length === 0) {
      // 최초 저장: 새로운 기록 생성
      records.push({
        longitude: updateDto.longitude ?? null,
        latitude: updateDto.latitude ?? null,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    } else if (records.length < 7) {
      // 7개 미만: 새 기록 추가
      records.push({
        longitude: updateDto.longitude,
        latitude: updateDto.latitude,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    } else {
      // 7개 이상: FIFO 방식으로 교체
      records.shift(); // 가장 오래된 기록 제거
      records.push({
        longitude: updateDto.longitude,
        latitude: updateDto.latitude,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    }

    // Redis에 업데이트된 데이터 저장
    await this.valkeyService.set(
      `LocationHistory:${user_id}`,
      JSON.stringify(records),
    );
    console.log(
      `✅ [Service] Valkey 최신화 완료 - 현재 데이터 개수: ${records.length}`,
    );
  }

  /**
   * 데이터베이스 동기화 (10분마다 실행)
   *
   * 기능:
   * - Redis의 위치 데이터를 DB에 동기화
   * - 데이터 영속성 보장
   * - 오래된 레코드 업데이트
   *
   * 프로세스:
   * 1. Redis에서 위치 데이터 조회
   * 2. 데이터 파싱 및 검증
   * 3. DB의 가장 오래된 레코드 찾기
   * 4. 레코드 업데이트 또는 새로운 레코드 생성
   *
   * @param user_id 사용자 ID
   */
  async updateDB(user_id: number): Promise<void> {
    console.log(`✅ [Service] updateDB() 실행 - user_id: ${user_id}`);

    let records: UpdateLocationHistoryDto[] = [];

    try {
      // Redis에서 데이터 조회
      let rawData: string | null = await this.valkeyService.get(
        `LocationHistory:${user_id}`,
      );

      if (typeof rawData === 'string') {
        try {
          const parsedData = JSON.parse(rawData);

          if (Array.isArray(parsedData)) {
            records = parsedData.map((item) => {
              if (typeof item === 'string') {
                return JSON.parse(item);
              }
              return item;
            });
          } else {
            console.error(
              `❌ [Service] Valkey 데이터가 배열이 아님:`,
              parsedData,
            );
          }
        } catch (error) {
          console.error(`❌ [Service] Valkey JSON 변환 오류:`, error);
        }
      } else {
        console.error(
          `❌ [Service] Valkey에서 받은 데이터가 문자열이 아님:`,
          rawData,
        );
      }
    } catch (error) {
      console.error(`❌ [Service] Valkey 데이터 가져오기 실패:`, error);
    }

    if (records.length === 0) {
      console.log(
        `⚠️ [Service] updateDB() - Valkey에 데이터 없음, 업데이트 중단`,
      );
      return;
    }

    // DB 업데이트 로직
    let oldestHistory = await this.repository.findOldestByUserId(user_id);
    for (const updateDto of records) {
      if (oldestHistory) {
        oldestHistory.longitude = updateDto.longitude;
        oldestHistory.latitude = updateDto.latitude;
        oldestHistory.timestamp = updateDto.timestamp ?? new Date();
        await this.repository.save(oldestHistory);
      } else {
        // 새 레코드 생성
        oldestHistory = await this.repository.create7(
          user_id,
          updateDto.longitude,
          updateDto.latitude,
          updateDto.timestamp ?? new Date(),
        );
      }
    }

    console.log(`✅ [Service] updateDB() 완료 - DB에 최신 데이터 반영됨`);
  }
}
