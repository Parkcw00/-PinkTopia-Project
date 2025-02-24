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
   * ✅ 로그인 시 DB 데이터를 valkey(캐시)에 저장
   */
  async createValkey(user_id: number): Promise<LocationHistory[]> {
    const loginLH = await this.repository.getLogin(user_id);

    await this.valkeyService.del(`LocationHistory:${user_id}`);
    await this.valkeyService.set(`LocationHistory:${user_id}`, loginLH);

    return loginLH; // ✅ 저장된 데이터를 반환
  }

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
   * ✅ 10초마다 실행되는 valkey(캐시) 업데이트
   */
  async updateValkey(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<void> {
    let history = await this.repository.findLatestByUserId(user_id);

    if (history) {
      history.latitude = updateDto.latitude ?? history.latitude;
      history.longitude = updateDto.longitude ?? history.longitude;
      history.timestamp = updateDto.timestamp ?? new Date(); // ✅ timestamp 적용

      await this.repository.save(history);
    } else {
      history = await this.repository.create7(
        user_id,
        updateDto.latitude,
        updateDto.longitude,
        updateDto.timestamp ?? new Date(), // ✅ timestamp 적용
      );
    }

    // ✅ valkey(캐시) 업데이트 추가
    await this.valkeyService.set(`LocationHistory:${user_id}`, history);
  }
  /**
   * ✅ 10분마다 실행되는 DB 업데이트
   */
  async updateDB(
    user_id: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<LocationHistory> {
    let history = await this.repository.findLatestByUserId(user_id);

    if (history) {
      history.latitude = updateDto.latitude ?? history.latitude;
      history.longitude = updateDto.longitude ?? history.longitude;
      history.timestamp = new Date();

      // ✅ save()가 LocationHistory를 반환하므로 문제 없음
      const updatedHistory = await this.repository.save(history);
      // console.log('✅ updateDB()에서 업데이트된 데이터:', updatedHistory);
      return updatedHistory;
    } else {
      // ✅ 새 데이터를 생성하고 반환
      const newHistory = await this.repository.create7(
        user_id,
        updateDto.latitude,
        updateDto.longitude,
        new Date(),
      );

      console.log('✅ updateDB()에서 새로 생성된 데이터:', newHistory);
      return newHistory;
    }
  }

  /**
   * ✅ 사용자 탈퇴 시 DB & valkey 데이터 삭제
   */
  async delete(user_id: number): Promise<void> {
    await this.repository.deleteByUserId(user_id);
    await this.valkeyService.del(`LocationHistory:${user_id}`);
  }
}
