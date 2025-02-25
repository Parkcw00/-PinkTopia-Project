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
  // /**
  //  * ✅ 로그인 시 valkey를 불러온다??
  //  */
  // async createDBValkey(user_id: number): Promise<LocationHistory[]> {
  //   const loginLH = await this.repository.getLogin(user_id);

  //   await this.valkeyService.del(`LocationHistory:${user_id}`);
  //   await this.valkeyService.set(
  //     `LocationHistory:${user_id}`,
  //     JSON.stringify(loginLH),
  //   );

  //   return loginLH; // ✅ 저장된 데이터를 반환
  // }

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
              ...parsedItem,
              timestamp: parsedItem.timestamp ?? new Date(),
            };
          })
        : [];
    } catch (error) {
      console.error(`❌ [Service] Valkey 데이터 파싱 오류:`, error);
      records = [];
    }

    if (records.length < 7) {
      records.push({
        ...updateDto,
        timestamp: updateDto.timestamp ?? new Date(),
      });
    } else {
      records.shift();
      records.push(updateDto);
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

    // ✅ Valkey에서 최신 위치 데이터 가져오기
    const latestData: UpdateLocationHistoryDto | null =
      await this.valkeyService.get(`LocationHistory:${user_id}`);

    if (!latestData) {
      console.log(
        `⚠️ [Service] updateDB() - Valkey에서 데이터 없음, 업데이트 중단`,
      );
      return;
    }

    console.log(`✅ [Service] Valkey에서 가져온 최신 데이터:`, latestData);

    // ✅ 가장 오래된 데이터 가져와서 업데이트
    let oldestHistory = await this.repository.findOldestByUserId(user_id);

    if (oldestHistory) {
      oldestHistory.latitude = latestData.latitude;
      oldestHistory.longitude = latestData.longitude;
      oldestHistory.timestamp = latestData.timestamp ?? new Date();

      await this.repository.save(oldestHistory);
      console.log(`✅ [Service] DB 최신화 완료 - 기존 데이터 업데이트됨`);
    } else {
      // ✅ 기존 데이터가 없으면 새로운 데이터 생성
      await this.repository.create7(
        user_id,
        latestData.latitude,
        latestData.longitude,
        latestData.timestamp ?? new Date(),
      );
      console.log(`✅ [Service] DB 최신화 완료 - 새로운 데이터 생성됨`);
    }
  }
}
