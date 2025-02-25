import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongAppearLocationRepository } from 'src/pinkmong-appear-location/pinkmong-appear-location.repository';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

import { ValkeyService } from '../valkey/valkey.service';
@Injectable()
export class PinkmongAppearLocationService {
  constructor(
    private readonly repository: PinkmongAppearLocationRepository,
    private readonly valkeyService: ValkeyService,
  ) {}

  //발키-임시/////
  async fillValkey() {
    // 1. DB에서 모든 서브업적 가져오기
    const db: PinkmongAppearLocation[] = await this.repository.findAll();

    if (!db || db.length === 0) {
      throw new NotFoundException('DB에 서브업적 데이터가 없습니다.');
    }

    // 2. Redis에 일괄 저장 (Pipeline 사용)
    const pipeline = this.valkeyService.getClient().pipeline();
    if (!pipeline) {
      throw new NotFoundException('Valkey(Pipeline)를 가져올 수 없습니다.');
    }

    for (const pink of db) {
      const key = `pinkmong-appear-location:${pink.id}`; // 고유 ID 사용

      const pinkData = {
        id: pink.id,
        title: pink.title,
        longitude: pink.longitude,
        latitude: pink.latitude,
        region_theme: pink.region_theme,
        created_at: pink.created_at?.toISOString() || null,
        updated_at: pink.updated_at?.toISOString() || null,
      };
      console.log(pinkData);

      pipeline.set(key, JSON.stringify(pinkData)); // Redis에 저장
    }

    await pipeline.exec(); // 🚀 일괄 실행 (반드시 await 사용)

    console.log(`✅ ${db.length}개의 서브업적이 Valkey에 저장되었습니다.`);

    return {
      message: `✅ ${db.length}개의 서브업적이 Valkey에 저장되었습니다.`,
    };
  }

  ///////

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
