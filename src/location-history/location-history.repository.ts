import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationHistory } from './entities/location-history.entity';

@Injectable()
export class LocationHistoryRepository {
  constructor(
    @InjectRepository(LocationHistory)
    private entity: Repository<LocationHistory>,
  ) {}

  /**
   * ✅ 7개의 기본 위치 데이터 중 하나를 생성
   */
  async create7(
    user_id: number,
    latitude: number = 0,
    longitude: number = 0,
    timestamp: Date = new Date(),
  ): Promise<LocationHistory> {
    const newHistory = this.entity.create({
      user_id,
      latitude,
      longitude,
      timestamp,
    });

    return await this.entity.save(newHistory); // ✅ 생성된 데이터를 반환
  }

  /**
   * ✅ 특정 유저 ID의 모든 위치 데이터를 가져옴 (로그인 시 사용)
   */
  async getLogin(user_id: number): Promise<LocationHistory[]> {
    return await this.entity.find({
      where: { user_id },
      order: { timestamp: 'ASC' }, // 오래된 데이터부터 가져오기
    });
  }

  /**
   * ✅ 가장 오래된 위치 데이터를 조회
   */
  async findOldestByUserId(user_id: number): Promise<LocationHistory | null> {
    return await this.entity.findOne({
      where: { user_id },
      order: { timestamp: 'ASC' }, // 가장 오래된 데이터를 가져오기
    });
  }

  /**
   * ✅ 위치 기록 데이터 저장 (updateValkey, updateDB에서 사용)
   */
  async save(history: LocationHistory): Promise<LocationHistory> {
    return await this.entity.save(history); // ✅ 올바르게 반환
  }

  /**
   * ✅ 모든 유저 ID 조회 (updateDBForAllUsers()에서 사용됨)
   */
  async getAllUserIds(): Promise<number[]> {
    const users = await this.entity
      .createQueryBuilder('location_history')
      .select('DISTINCT user_id')
      .getRawMany();

    return users.map((user) => user.user_id);
  }
}
