import { Injectable, NotFoundException } from '@nestjs/common';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class DirectionService {
  constructor(private readonly valkeyService: ValkeyService) {}

  async createBookmarks() {
    // ✅ Redis SCAN을 사용하여 패턴에 맞는 키들을 가져옴

    // 서브업적 키만 가져옴
    const keysS: string[] =
      await this.valkeyService.getKeysByPattern(`sub-achievement:*`);
    console.log('🔍 keyssS 확인:', keysS);

    // 핑크몽 발생위치 키만 가져옴
    const keysP: string[] = await this.valkeyService.getKeysByPattern(
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

    // 반복문 2번째 돌았을 때  부터 문제 발생
    if (!keysS || keysS.length < 1) {
      throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
    }
    // 반복문 돌면서 키값으로 데이터 읽어오기
    for (let keyS of keysS) {
      const data: any = await this.valkeyService.get(keyS);

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
    // console.log('타입확인', bookmarksS);

    if (!keysP || keysP.length < 1) {
      throw new NotFoundException('발키에 핑크몽 리스트트 데이터가 없습니다.');
    }

    for (let keyP of keysP) {
      const dataP: any = await this.valkeyService.get(keyP);
      // console.log('타입확인', dataP);

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

    // console.log(`왔음`);
    //console.log({ bookmarksS, bookmarksP });
    return { bookmarksS, bookmarksP };
  }
}
