import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
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

    // 서브업적 키만 가져옴
    const keysS =
      await this.valkeyService.getKeysByPattern(`sub-achievement:*`);
    console.log('🔍 keyssS 확인:', keysS);

    // 핑크몽 발생위치 키만 가져옴
    const keysP: any = await this.valkeyService.getKeysByPattern(
      `pinkmong-appear-location:*`,
    );
    console.log('🔍 keyssP 확인:', keysP);

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

    if (!keysS || keysS.length < 1) {
      throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
    }
    // 반복문 돌면서 키값으로 데이터 읽어오기
    for (let keyS of keysS) {
      /*  if (type !== 'hash') {
        console.warn(`Skipping non-hash key: ${keyS}`);
        continue;
      }*/

      //  let data = await this.valkeyService.hgetall(keyS);
      const dataStr = await this.valkeyService.get(keysS);
      const data = dataStr ? JSON.parse(dataStr) : null;
      console.log('타입확인', data);
      switch (data) {
        case 'hash':
          console.log(`type : hash`);
          let data = await this.valkeyService.hgetall(keyS);
          // 기존 로직
          break;

        case 'string':
          console.log(`type : string`);
          let stringValue = await this.valkeyService.get(keyS);
          //console.warn(`Processing string key: ${keyS}`);
          break;

        case 'list':
          console.log(`type : list`);
          let listValues = await this.valkeyService.lrange(keyS, 0, -1);
          //console.warn(`Processing list key: ${keyS}`);
          break;

        case 'set':
          console.log(`type :set`);
          //let setValues = await this.valkeyService.smembers(keyS);
          //console.warn(`Processing set key: ${keyS}`);
          break;

        case 'zset':
          console.log(`type : zset`);
          /* let zsetValues = await this.valkeyService.zrange(
            keyS,
            0,
            -1,
            'WITHSCORES',
          );*/
          //console.warn(`Processing sorted set key: ${keyS}`);
          break;

        default:
          console.log(`type : default`);
        //console.warn(`Skipping unsupported type (${type}) for key: ${keyS}`);
      }

      if (data && Object.keys(data).length > 0) {
        bookmarksS.push({
          title: data.title,
          latitude: data.latitude,
          longitude: data.longitude,
          mission_type: data.mission_type,
          content: data.content,
          expiration_at: data.expiration_at,
          sub_achievement_images: JSON.parse(data.sub_achievement_images),
          achievement_id: data.achievement_id,
          deleted_at: data.deleted_at,
        });
      }
    }

    if (!keysP || keysP.length < 1) {
      throw new NotFoundException('발키에 핑크몽 리스트트 데이터가 없습니다.');
    }

    for (const keyP of keysP) {
      const type = await this.valkeyService.type(keyP);
      if (type !== 'hash') {
        console.warn(`Skipping non-hash key: ${keyP}`);
        continue;
      }

      let dataP = await this.valkeyService.hgetall(keyP);
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
    console.log(`왔음`);
    console.log({ bookmarksS, bookmarksP });
    return { bookmarksS, bookmarksP };
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
