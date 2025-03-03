import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongAppearLocationRepository } from 'src/pinkmong-appear-location/pinkmong-appear-location.repository';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';
import { ValkeyService } from 'src/valkey/valkey.service';
import { GeoService } from '../geo/geo.service';
import { RegionTheme } from '../pinkmong-appear-location/entities/pinkmong-appear-location.entity';

@Injectable()
export class PinkmongAppearLocationService {
  constructor(
    private readonly repository: PinkmongAppearLocationRepository,
    private readonly valkeyService: ValkeyService, // 🛠️ ValkeyService 추가
    private readonly geoService: GeoService,
  ) {}

  async fillValkey() {
    // 1. DB에서 모든 PinkmongAppearLocation 정보 가져오기
    const locations: PinkmongAppearLocation[] =
      await this.repository.findAllForValkey();

    if (!locations || locations.length === 0) {
      throw new NotFoundException('DB에 저장된 등장 위치 데이터가 없습니다.');
    }
    /*
    // 2. Redis Pipeline 사용
    const pipeline = this.valkeyService.getClient().pipeline();
    if (!pipeline) {
      throw new NotFoundException('Valkey(Pipeline)를 가져올 수 없습니다.');
    }*/

    for (const location of locations) {
      const key = `pinkmong-appear-location:${location.id}`; // 고유 ID 사용

      const locationData = {
        id: location.id,
        title: location.title, // 제목
        latitude: location.latitude, // 위도
        longitude: location.longitude, // 경도
        region_theme: location.region_theme as RegionTheme, // 지역 테마 (forest, desert 등)
        created_at: location.created_at?.toISOString() || '', // 생성일
        updated_at: location.updated_at?.toISOString() || '', // 수정일
        deleted_at: location.deleted_at?.toISOString() || '',
      };
      console.log(locationData);

      await this.geoService.geoAddBookmarkP(key, locationData);
      //   pipeline.set(key, JSON.stringify(locationData)); // Redis에 저장
    }

    //  await pipeline.exec(); // 🚀 일괄 실행 (반드시 await 사용)

    console.log(
      `✅ ${locations.length}개의 Pinkmong 등장 위치가 Valkey에 저장되었습니다.`,
    );

    return {
      message: `✅ ${locations.length}개의 Pinkmong 등장 위치가 Valkey에 저장되었습니다.`,
    };
  }

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
