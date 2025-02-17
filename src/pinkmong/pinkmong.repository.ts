import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * PinkmongRepository
 * 
 * 핑크몽 데이터를 데이터베이스에서 조회, 생성, 수정, 삭제하는 역할을 담당하는 클래스
 */
@Injectable()
export class PinkmongRepository {
  constructor(
    @InjectRepository(Pinkmong)
    private readonly repository: Repository<Pinkmong>,
  ) {}

  /**
   * 특정 핑크몽 조회
   * 
   * param pinkmongId - 조회할 핑크몽의 ID
   * returns 해당 ID의 핑크몽 정보를 반환하거나, 존재하지 않을 경우 null 반환
   */
  async findById(pinkmongId: number): Promise<Pinkmong | null> {
    return this.repository.findOne({ where: { id: pinkmongId } });
  }

  /**
   * 모든 핑크몽 조회
   * 
   * returns 데이터베이스에 저장된 모든 핑크몽 목록 반환
   */
  async findAll(): Promise<Pinkmong[]> {
    return this.repository.find();
  }

  /**
   * 핑크몽 생성
   * 
   * param pinkmongData - 생성할 핑크몽의 데이터
   * returns 생성된 핑크몽 정보 반환
   */
  async createPinkmong(pinkmongData: Partial<Pinkmong>): Promise<Pinkmong> {
    const pinkmong = this.repository.create(pinkmongData);
    return this.repository.save(pinkmong);
  }

  /**
   * 핑크몽 업데이트
   * 
   * param pinkmong - 수정할 핑크몽 객체
   * returns 수정된 핑크몽 정보 반환
   */
  async updatePinkmong(pinkmong: Pinkmong): Promise<Pinkmong> {
    return this.repository.save(pinkmong);
  }

  /**
   * 핑크몽 삭제
   * 
   * param pinkmong - 삭제할 핑크몽 객체
   */
  async deletePinkmong(pinkmong: Pinkmong): Promise<void> {
    await this.repository.remove(pinkmong);
  }
}
