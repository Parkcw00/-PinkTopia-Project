import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PinkmongRepository {
  constructor(
    @InjectRepository(Pinkmong)
    private readonly repository: Repository<Pinkmong>,
  ) {}

  /**
   * 특정 핑크몽 조회
   * returns 해당 ID의 핑크몽 정보를 반환하거나, 존재하지 않을 경우 null 반환
   */
  async findById(pinkmongId: number): Promise<Pinkmong | null> {
    return this.repository.findOne({ where: { id: pinkmongId } });
  }

  /**
   * 모든 핑크몽 조회
   * returns 데이터베이스에 저장된 모든 핑크몽 목록 반환
   */
  async findAll(): Promise<Pinkmong[]> {
    return this.repository.find();
  }

  /**
   * 핑크몽 생성
   * returns 생성된 핑크몽 정보 반환
   */
  async createPinkmong(pinkmongData: Partial<Pinkmong>): Promise<Pinkmong> {
    const pinkmong = this.repository.create(pinkmongData);
    return this.repository.save(pinkmong);
  }

  /**
   * 핑크몽 업데이트
   * returns 수정된 핑크몽 정보 반환
   */
  async updatePinkmong(pinkmong: Pinkmong): Promise<Pinkmong> {
    return this.repository.save(pinkmong);
  }

  /**
   * 핑크몽 삭제
   * param pinkmong - 삭제할 핑크몽 객체
   */
  async deletePinkmong(pinkmong: Pinkmong): Promise<void> {
    await this.repository.remove(pinkmong);
  }
}
