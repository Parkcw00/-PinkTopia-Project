import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

@Injectable()
export class PinkmongAppearLocationRepository {
  constructor(
    @InjectRepository(PinkmongAppearLocation)
    private readonly repository: Repository<PinkmongAppearLocation>,
  ) {}

  async createLocation(
    data: Partial<PinkmongAppearLocation>,
  ): Promise<PinkmongAppearLocation> {
    const location = this.repository.create(data); // 🔹 변경됨 (user 정보 삭제)
    return await this.repository.save(location);
  }

  async findAll(): Promise<PinkmongAppearLocation[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<PinkmongAppearLocation | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async deleteLocation(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}
