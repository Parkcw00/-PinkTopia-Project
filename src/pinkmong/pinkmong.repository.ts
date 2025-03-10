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

  async findById(pinkmongId: number): Promise<Pinkmong | null> {
    return this.repository.findOne({ where: { id: pinkmongId } });
  }

  async findAll(): Promise<Pinkmong[]> {
    return this.repository.find();
  }

  async createPinkmong(pinkmongData: Partial<Pinkmong>): Promise<Pinkmong> {
    const pinkmong = this.repository.create(pinkmongData);
    return this.repository.save(pinkmong);
  }

  async updatePinkmong(pinkmong: Pinkmong): Promise<Pinkmong> {
    return this.repository.save(pinkmong);
  }

  async deletePinkmong(pinkmong: Pinkmong): Promise<void> {
    await this.repository.remove(pinkmong);
  }
}
