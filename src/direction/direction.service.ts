import { Injectable } from '@nestjs/common';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { PinkmongAppearLocation } from '../pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { Entity } from 'typeorm';

@Injectable()
export class DirectionService {
  constructor(
    private readonly subEntity: SubAchievement,
    private readonly pinkEntity: PinkmongAppearLocation,
    private readonly s3Service: S3Service,
    private readonly valkeyService: ValkeyService,
  ) {}

  async createBookmarks() {
    // ✅ Redis SCAN을 사용하여 패턴에 맞는 키들을 가져옴
    const keysS = await this.scanKeys('subEntity:*');
    const keysP = await this.scanKeys('pinkEntity:*');

    const bookmarksS: Array<{
      title: any;
      latitude: any;
      longitude: any;
      mission_type: any;
      content: any;
      expiration_at: any;
      sub_achievement_images: any;
      achievement_id: any;
      deleted_at: any;
    }> = [];

    const bookmarksP: Array<{
      title: any;
      latitude: any;
      longitude: any;
      region_theme: any;
      content: any;
      deleted_at: any;
    }> = [];

    for (const key of keysS) {
      let data = await this.valkeyService.hgetall(key);
      if (data && Object.keys(data).length > 0) {
        bookmarksS.push({
          title: data.title,
          latitude: data.latitude,
          longitude: data.longitude,
          mission_type: data.mission_type,
          content: data.content,
          expiration_at: data.expiration_at,
          sub_achievement_images: data.sub_achievement_images,
          achievement_id: data.achievement_id,
          deleted_at: data.deleted_at,
        });
      }
    }

    for (const key of keysP) {
      let dataP = await this.valkeyService.hgetall(key);
      if (dataP && Object.keys(dataP).length > 0) {
        bookmarksP.push({
          title: dataP.title,
          latitude: dataP.latitude,
          longitude: dataP.longitude,
          region_theme: dataP.region_theme,
          content: dataP.content,
          deleted_at: dataP.deleted_at,
        });
      }
    }

    return { bookmarksS, bookmarksP };
  }

  // Redis SCAN을 활용하여 키 목록 가져오기
  private async scanKeys(pattern: string): Promise<string[]> {
    let cursor = '0';
    let keys: string[] = [];

    do {
      const [newCursor, foundKeys] = await this.valkeyService
        .getClient()
        .scan(cursor, 'MATCH', pattern);
      cursor = newCursor;
      keys = keys.concat(foundKeys);
    } while (cursor !== '0');

    return keys;
  }

  findOne(id: number) {
    return `This action returns a #${id} direction`;
  }

  update(id: number, updateDirectionDto: UpdateDirectionDto) {
    return `This action updates a #${id} direction`;
  }

  remove(id: number) {
    return `This action removes a #${id} direction`;
  }
}
