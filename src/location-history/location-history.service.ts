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
  async createDB(user_id: number): Promise<LocationHistory[]> {
    const defaultRecords: LocationHistory[] = [];
    for (let i = 0; i < 7; i++) {
      const record = await this.repository.create7(user_id);
      defaultRecords.push(record);
    }
    return defaultRecords;
  }
  /**
   * ✅ 로그인 시 DB 데이터를 valkey(캐시)에 저장
   */
  async createValkey(user_id: number): Promise<LocationHistory[]> {
    const loginLH = await this.repository.getLogin(user_id);

    await this.valkeyService.del(`LocationHistory:${user_id}`);
    await this.valkeyService.rpush(
      `LocationHistory:${user_id}`,
      JSON.stringify(loginLH),
    );

    return loginLH; // ✅ 저장된 데이터를 반환
  }

  /**
   * ✅ 10초마다 실행되는 valkey(캐시) 업데이트
   */
  async updateValkey(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<void> {
    console.log(`✅ [Service] updateValkey() 실행 - user_id: ${user_id}`);

    // ✅ Valkey(캐시) 초기화
    await this.valkeyService.del(`LocationHistory:${user_id}`);
    console.log(`✅ [Service] 기존 Valkey 데이터 삭제 완료`);

    // ✅ DB에서 최신 데이터 가져오기
    let records = await this.repository.getLogin(user_id);
    console.log(
      `✅ [Service] 현재 저장된 위치 데이터 개수 (DB 기준): ${records.length}`,
    );

    if (records.length < 7) {
      // ✅ 7개 미만이면 새로운 데이터를 추가
      await this.repository.create7(
        user_id,
        updateDto.latitude,
        updateDto.longitude,
        updateDto.timestamp ?? new Date(),
      );
    } else {
      // ✅ 7개 이상이면 가장 오래된 데이터를 찾아 최신 위치로 업데이트
      let oldestHistory = await this.repository.findOldestByUserId(user_id);
      if (oldestHistory) {
        oldestHistory.latitude = updateDto.latitude;
        oldestHistory.longitude = updateDto.longitude;
        oldestHistory.timestamp = updateDto.timestamp ?? new Date();
        await this.repository.save(oldestHistory);
      }
    }

    // ✅ Valkey(캐시)에서 7개 초과 데이터 삭제
    records = await this.repository.getLogin(user_id);
    if (records.length > 7) {
      const excessRecords = records.slice(0, records.length - 7); // ✅ 초과 데이터 찾기
      for (const record of excessRecords) {
        await this.repository.deleteByUserId(record.id); // ✅ 초과 데이터 삭제
      }
    }

    // ✅ Valkey에 최신 7개 데이터 저장
    records = await this.repository.getLogin(user_id);
    await this.valkeyService.set(`LocationHistory:${user_id}`, records);
    console.log(`✅ [Service] Valkey에 최신 위치 데이터 저장 완료`);
  }

  /**
   * ✅ 10분마다 실행되는 DB 업데이트
   */
  async updateDB(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<LocationHistory> {
    console.log(`✅ [Service] updateDB() 실행 - user_id: ${user_id}`);

    // ✅ DB에서 최신 데이터 가져오기
    let records = await this.repository.getLogin(user_id);
    console.log(
      `✅ [Service] 현재 저장된 위치 데이터 개수 (DB 기준): ${records.length}`,
    );

    if (records.length < 7) {
      // ✅ 7개 미만이면 새로운 데이터를 추가
      return await this.repository.create7(
        user_id,
        updateDto.latitude,
        updateDto.longitude,
        updateDto.timestamp ?? new Date(),
      );
    } else {
      // ✅ 7개 이상이면 가장 오래된 데이터를 찾아 최신 위치로 업데이트
      let oldestHistory = await this.repository.findOldestByUserId(user_id);
      if (oldestHistory) {
        oldestHistory.latitude = updateDto.latitude;
        oldestHistory.longitude = updateDto.longitude;
        oldestHistory.timestamp = updateDto.timestamp ?? new Date();
        return await this.repository.save(oldestHistory);
      }
    }

    // ✅ DB에서도 7개 초과 데이터 삭제
    records = await this.repository.getLogin(user_id);
    if (records.length > 7) {
      const excessRecords = records.slice(0, records.length - 7); // ✅ 초과 데이터 찾기
      for (const record of excessRecords) {
        await this.repository.deleteByUserId(record.id); // ✅ 초과 데이터 삭제
      }
    }

    return records[0]; // ✅ 7개 유지 후 최신 데이터 반환
  }

  /**
   * ✅ 사용자 탈퇴 시 DB & valkey 데이터 삭제
   */
  async delete(user_id: number): Promise<void> {
    await this.repository.deleteByUserId(user_id);
    await this.valkeyService.del(`LocationHistory:${user_id}`);
  }
}
