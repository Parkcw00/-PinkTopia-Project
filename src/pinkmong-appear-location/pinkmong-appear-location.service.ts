import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongAppearLocationRepository } from 'src/pinkmong-appear-location/pinkmong-appear-location.repository';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

@Injectable()
export class PinkmongAppearLocationService {
  constructor(private readonly repository: PinkmongAppearLocationRepository) {}

  async createLocation(
    dto: CreatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    return this.repository.createLocation(dto);
  }

  async getAllLocations(): Promise<PinkmongAppearLocation[]> {
    return this.repository.findAll();
  }

  async getLocationById(id: number): Promise<PinkmongAppearLocation> {
    const location = await this.repository.findById(id);
    if (!location) {
      throw new NotFoundException(`ID ${id}에 해당하는 위치가 없습니다.`);
    }
    return location;
  }

  async deleteLocation(id: number): Promise<void> {
    return this.repository.deleteLocation(id);
  }
}
