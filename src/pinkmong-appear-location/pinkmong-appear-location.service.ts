import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongAppearLocationRepository } from 'src/pinkmong-appear-location/pinkmong-appear-location.repository';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

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

  async updateLocation(
    id: number,
    updateDto: UpdatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    // 업데이트 수행 및 업데이트 결과 반환
    const updatedLocation = await this.repository.updateLocation(id, updateDto);
    if (!updatedLocation) {
      throw new NotFoundException(`ID ${id}에 해당하는 위치가 없습니다.`);
    }
    return updatedLocation;
  }
  async deleteLocation(id: number): Promise<void> {
    return this.repository.deleteLocation(id);
  }
}
