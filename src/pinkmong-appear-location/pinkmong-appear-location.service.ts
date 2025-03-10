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

    for (const location of locations) {
      const key = `pinkmong-appear-location`; //:${location.id}`; // 고유 ID 사용

      const locationData = {
        id: location.id,
        title: location.title,
        longitude: location.longitude,
        latitude: location.latitude,
        region_theme: location.region_theme as RegionTheme,
        created_at: location.created_at?.toISOString() || '',
        updated_at: location.updated_at?.toISOString() || '',
        deleted_at: location.deleted_at?.toISOString() || '',
      };

      console.log('🚀 저장할 데이터:', locationData);

      // 4. Valkey(Redis)에 저장
      await this.geoService.geoAddBookmarkP(key, locationData);
    }

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

  async findOneByEmail(
    user_email: string,
  ): Promise<{ id: number } | undefined> {
    console.log('S - 타이틀로 id 가져오기');
    const id = await this.repository.findOneByEmail(user_email);
    return id ?? undefined;
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
    console.log('S - 삭제!!!', id);
    return this.repository.deleteLocation(id);
  }
}
