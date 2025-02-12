import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pinkmong } from './entities/pinkmong.entity';

@Injectable()
export class PinkmongService {
  constructor(
    @InjectRepository(Pinkmong)
    private readonly pinkmongRepository: Repository<Pinkmong>,
  ) {}

  /** 핑크몽 생성 */
  async createPinkmong(data: Partial<Pinkmong>) {
    const pinkmong = this.pinkmongRepository.create(data);
    await this.pinkmongRepository.save(pinkmong);
    return { message: '핑크몽 생성이 완료 되었습니다.' };
  }

  /** 특정 핑크몽 조회 */
  async getPinkmong(pinkmongId: number) {
    const pinkmong = await this.pinkmongRepository.findOne({ where: { id: pinkmongId } });
    if (!pinkmong) throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });
    return pinkmong;
  }

  /** 모든 핑크몽 조회 */
  async getAllPinkmongs() {
    const pinkmongs = await this.pinkmongRepository.find();
    return { message: '핑크몽 전체 정보 조회 성공', pinkmongs };
  }

  /** 핑크몽 수정 */
  async updatePinkmong(pinkmongId: number, data: Partial<Pinkmong>) {
    const pinkmong = await this.pinkmongRepository.findOne({ where: { id: pinkmongId } });
    if (!pinkmong) throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    Object.assign(pinkmong, data);
    await this.pinkmongRepository.save(pinkmong);
    return { message: '핑크몽 수정이 완료 되었습니다.' };
  }

  /** 핑크몽 삭제 (소프트 삭제) */
  async deletePinkmong(pinkmongId: number) {
    const pinkmong = await this.pinkmongRepository.findOne({ where: { id: pinkmongId } });
    if (!pinkmong) throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    await this.pinkmongRepository.softRemove(pinkmong);
    return { message: '핑크몽 삭제가 완료 되었습니다.' };
  }
}
