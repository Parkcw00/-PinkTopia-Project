import { Injectable } from '@nestjs/common';
import { LocationHistory } from './entities/location-history.entity';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';
import { LocationHistoryRepository } from './location-history.repository';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class LocationHistoryService {
  constructor(
    private readonly repository: LocationHistoryRepository,
    private readonly valkeyService: ValkeyService, // ✅ ValkeyService 주입
  ) {}

  /**
   * ✅ 회원가입 시 기본 7개의 위치 데이터를 생성
   */
  async createDefault(user_id: number): Promise<LocationHistory[]> {
    const defaultRecords: LocationHistory[] = [];
    for (let i = 0; i < 7; i++) {
      const record = await this.repository.create7(user_id);
      defaultRecords.push(record);
    }
    await this.valkeyService.del(`LocationHistory:${user_id}`);
    await this.valkeyService.set(`LocationHistory:${user_id}`, defaultRecords);
    console.log(`✅ [Service] Valkey에도 기본 위치 데이터 7개 저장 완료`);

    return defaultRecords;
  }

  /**
   * ✅ 10초마다 실행되는 valkey(캐시) 업데이트
   */
  async updateValkey(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<void> {
    console.log(`✅ [Service] updateValkey() 실행 - user_id: ${user_id}`);

    let records: UpdateLocationHistoryDto[] = [];
    try {
      let rawData = await this.valkeyService.get(`LocationHistory:${user_id}`);
      if (typeof rawData === 'string') {
        rawData = JSON.parse(rawData);
      }
      records = Array.isArray(rawData)
        ? rawData.map((item) => {
            const parsedItem =
              typeof item === 'string' ? JSON.parse(item) : item;
            return {
              latitude: parsedItem.latitude, // ✅ userId를 제외
              longitude: parsedItem.longitude,
              timestamp:
                parsedItem.timestamp &&
                !isNaN(new Date(parsedItem.timestamp).getTime())
                  ? new Date(parsedItem.timestamp)
                  : new Date(), // ✅ timestamp가 없거나 비정상적인 값이면 현재 시간으로 대체
            };
          })
        : [];
    } catch (error) {
      console.error(`❌ [Service] Valkey 데이터 파싱 오류:`, error);
      records = [];
    }

    if (records.length === 0) {
      // ✅ 최초 저장 시 값이 제대로 들어가도록 보장
      records.push({
        latitude: updateDto.latitude ?? null,
        longitude: updateDto.longitude ?? null,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    } else if (records.length < 7) {
      records.push({
        latitude: updateDto.latitude,
        longitude: updateDto.longitude,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    } else {
      records.shift();
      records.push({
        latitude: updateDto.latitude,
        longitude: updateDto.longitude,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    }

    // ✅ Valkey에 최신 위치 데이터 저장 (7개까지만 유지)
    await this.valkeyService.set(
      `LocationHistory:${user_id}`,
      JSON.stringify(records),
    );
    console.log(
      `✅ [Service] Valkey 최신화 완료 - 현재 데이터 개수: ${records.length}`,
    );
  }

  /**
   * ✅ 10분마다 실행되는 DB 업데이트
   */
  async updateDB(user_id: number): Promise<void> {
    console.log(`✅ [Service] updateDB() 실행 - user_id: ${user_id}`);

    let records: UpdateLocationHistoryDto[] = [];

    try {
      let rawData: string | null = await this.valkeyService.get(
        `LocationHistory:${user_id}`,
      );

      if (typeof rawData === 'string') {
        try {
          const parsedData = JSON.parse(rawData); // JSON 변환

          if (Array.isArray(parsedData)) {
            records = parsedData.map((item) => {
              if (typeof item === 'string') {
                return JSON.parse(item); // 문자열인 경우 다시 JSON 변환
              }
              return item; // 이미 객체라면 그대로 사용
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

    let oldestHistory = await this.repository.findOldestByUserId(user_id);
    for (const updateDto of records) {
      if (oldestHistory) {
        oldestHistory.latitude = updateDto.latitude;
        oldestHistory.longitude = updateDto.longitude;
        oldestHistory.timestamp = updateDto.timestamp ?? new Date();
        await this.repository.save(oldestHistory);
      } else {
        oldestHistory = await this.repository.create7(
          user_id,
          updateDto.latitude,
          updateDto.longitude,
          updateDto.timestamp ?? new Date(),
        );
      }
    }

    console.log(`✅ [Service] updateDB() 완료 - DB에 최신 데이터 반영됨`);
  }
}
