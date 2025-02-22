import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationHistory } from './entities/location-history.entity';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';
import { LocationHistoryRepository } from './location-history.repository';
import { CreateLocationHistoryDto } from './dto/create-location-history.dto';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class LocationHistoryService {
  constructor(
    @InjectRepository(LocationHistory)
    private readonly repository: LocationHistoryRepository,
    private readonly valkeyService: ValkeyService,
  ) {}
}
/**
 * 회원가입 시 유저id와 연결된 7개의 디폴트 데이터를 생성합니다.
 */ /*
  async createDB(user_id: number): Promise<LocationHistory[]> {
    const defaultRecords: LocationHistory[] = [];

    // 7개의 기본 레코드 생성
    for (let i = 0; i < 7; i++) {
      await this.valkeyService.del(`LocationHistory:`);
      defaultRecords.push(await this.repository.create7(user_id));
    }
    return defaultRecords;
  }

  // 로그인 시 valkey에 로그인 정보를 업데이트
  async createValkey(user_id: number): Promise<void> {
    // DB에서 로그인 정보를 가져오기
    const loginLH = await this.repository.getLogin(user_id);

    // 기존의 LocationHistory 관련 키 삭제 (예: Redis에서 기존 데이터를 제거)
    await this.valkeyService.del(`LocationHistory:${user_id}`);

    // 새롭게 가져온 로그인 정보를 valkey에 저장 (예: Redis에 set)
    await this.valkeyService.set(`LocationHistory:${user_id}`, loginLH);
  }

  //////////////////////////////////////////////////

  // 10초에 한번
  async updateValkey(user_id, updateLocationHistoryDto) {
    // 사용자별로 고유한 키를 구성하여 업데이트
    // 가장 오래된 업데이트(최소 timestamp)를 가진 데이터를 ASC 정렬 후 첫 번째로 조회
    const oldestUpdate = await this.valkeyService.findOne({
      where: { user_id },
      order: { timestamp: 'ASC' },
    });

    // 가장 최신 업데이트(최대 timestamp)를 가진 데이터를 DESC 정렬 후 첫 번째로 조회
    const lastUpdate = await this.valkeyService.findOne({
      where: { user_id },
      order: { timestamp: 'DESC' },
    });
    await this.valkeyService.set(
      `LocationHistory:${user_id}`,
      updateLocationHistoryDto,
    );
  }

  // 3분에 한번
  async updateDB(user_id, updateLocationHistoryDto) {
    // 최신 레코드를 찾아 위도경도 비교. 벡터값이 3m 이내면 throw, 더 많이 움직였으면 업데이트
    let history = await this.repository.findLatestByUserId(user_id);

    if (history) {
      // 기존 기록 업데이트 (업데이트 DTO에 값이 있으면 덮어씌우고, 그렇지 않으면 기존 값을 유지)
      history.latitude = updateLocationHistoryDto.latitude ?? history.latitude;
      history.longitude =
        updateLocationHistoryDto.longitude ?? history.longitude;
      // timestamp는 현재 시간으로 갱신
      history.timestamp = new Date();

      return await this.repository.save(history);
    } else {
      // 기록이 없다면 새롭게 생성
      const newHistory = await this.repository.create({
        user_id,
        latitude: updateLocationHistoryDto.latitude,
        longitude: updateLocationHistoryDto.longitude,
        timestamp: new Date(),
      });
      return await this.repository.save(newHistory);
    }
  }
  async delete(user_id) {}
*/
/*
  async create(
    user_id: number,
    createLocationHistoryDto: CreateLocationHistoryDto,
  ): Promise<LocationHistory[]> {
    const records: LocationHistory[] = [];
    for (let i = 0; i < 7; i++) {
      const record = this.locationHistoryRepository.create({
        ...createLocationHistoryDto,
        timestamp: new Date(), // 기본 타임스탬프 (필요에 따라 조정)
      });
      records.push(record);
    }
    return await this.locationHistoryRepository.save(records);
  }

  /**
   * 10초마다 실행되어, 해당 유저의 7개 데이터 중 수정 기한(여기서는 timestamp 기준)이 가장 오래된 데이터를 업데이트합니다.
   */ /*
  async updateValkey(
    userId: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<LocationHistory> {
    const record = await this.locationHistoryRepository.findOne({
      where: { user_id: userId },
      order: { timestamp: 'ASC' },
    });
    if (!record) {
      throw new NotFoundException('Location history record not found');
    }
    Object.assign(record, updateDto);
    return await this.locationHistoryRepository.save(record);
  }

  /**
   * 10분마다 실행되어, 해당 유저의 7개 데이터 중 수정 기한이 가장 오래된 데이터를 업데이트합니다.
   * (여기서는 updateValkey와 동일한 로직이나, 실제 로직에 따라 분기 가능)
   */ /*
  async updateDB(
    userId: number,
    updateDto: UpdateLocationHistoryDto,
  ): Promise<LocationHistory> {
    const record = await this.locationHistoryRepository.findOne({
      where: { user_id: userId },
      order: { timestamp: 'ASC' },
    });
    if (!record) {
      throw new NotFoundException('Location history record not found');
    }
    Object.assign(record, updateDto);
    return await this.locationHistoryRepository.save(record);
  }

  /**
   * 탈퇴 시 해당 유저와 연결된 모든 데이터를 삭제합니다.
   */ /*
  async delete(
    userId: number,
    updateLocationHistoryDto: UpdateLocationHistoryDto,
  ): Promise<void> {
    await this.locationHistoryRepository.delete({ user_id: userId });
  }*/
//}
