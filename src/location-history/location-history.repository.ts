import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationHistory } from './entities/location-history.entity';
import { number } from 'joi';

@Injectable()
export class LocationHistoryRepository {
  constructor(
    @InjectRepository(LocationHistory)
    private entity: Repository<LocationHistory>,
  ) {}
  async create7(user_id: number): Promise<LocationHistory> {
    const newHistory = await this.entity.create({
      latitude: 0.0,
      longitude: 0.0,
      user_id: user_id,
      timestamp: new Date(),
    });
    return await this.entity.save(newHistory);
  }
  async getLogin(user_id: number): Promise<LocationHistory[]> {
    return await this.entity.find({ where: { user_id } });
  }
  //   /**
  //   * 유저 ID에 해당하는 데이터 중 timestamp가 가장 오래된(수정 기한이 가장 오래된) 레코드를 조회합니다.
  //   * @param userId 유저 식별자
  //   * @returns 가장 오래된 LocationHistory 엔티티
  //   */

  //  async getOldestRecord(userId: number): Promise<LocationHistory> {
  //    return this.findOne({
  //      where: { user_id: userId },
  //      order: { timestamp: 'ASC' },
  //    });
  //  }

  //  /**
  //   * 특정 유저 ID에 해당하는 모든 LocationHistory 데이터를 삭제합니다.
  //   * @param userId 유저 식별자
  //   */
  //  async deleteByUserId(userId: number): Promise<void> {
  //    await this.delete({ user_id: userId });
  //  }
}
