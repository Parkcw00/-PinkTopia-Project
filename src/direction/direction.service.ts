import { Injectable, NotFoundException } from '@nestjs/common';
import { ValkeyService } from '../valkey/valkey.service';
import { AchievementPService } from '../achievement-p/achievement-p.service';
import { CompareDirection } from './dto/compare-direction.dto';
import { getDistance, isPointWithinRadius } from 'geolib';
import axios, { all } from 'axios'; // HTTP 요청을 보내기 위한 클라이언트 라이브러리
import { DirectionGateway } from './/direction.gateway';
import { Socket } from 'socket.io';
import { number } from 'joi';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class DirectionService {
  constructor(
    private readonly valkeyService: ValkeyService,
    private readonly geoService: GeoService,
    private readonly APService: AchievementPService,
    private readonly directionGateway: DirectionGateway,
  ) {}

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
      subId: any;
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
      //  content: any; 보류 ㅜㅜ
      deleted_at: any;
    }> = [];

    if (!keysS || keysS.length < 1) {
      throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
    }
    // 반복문 돌면서 키값으로 데이터 읽어오기
    for (let keyS of keysS) {
      const data: any = await this.valkeyService.get(keyS);

      if (data && Object.keys(data).length > 0) {
        bookmarksS.push({
          subId: data.id,
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
          //    content: dataP.content,
          deleted_at: dataP.deleted_at,
        });
      }
    }
    //console.log({ bookmarksS, bookmarksP });
    return { bookmarksS, bookmarksP };
  }

  //발키 P,S 읽어오기
  // 사용자와 거리가 5m 이내인 경우 목록만들기 이벤트S 실행
  //   유저id에 연결된 업적P 목록과 겹치지 않는지 확인. 겹치면 throw, 없으면 업적P에 추가, 알림창 보이기
  // 사용자와 거리가 5m 이내인 경우 이벤트P 실행
  //   핑크몽 캡처 이벤트 실행하고 여기는 종료. 이미 실행됬으면 중복 실행되지 않게

  async compareBookmark(
    user_id: number,
    latitude: number,
    longitude: number,
    client: Socket,
  ) {
    // 🏆 서브업적
    try {
      console.log('🔍 keyssS 확인:1');
      const nearBybookmarksS = await this.geoService.getNearbyBookmarkP(
        latitude,
        longitude,
      );
      console.log('🔍 keyssS 확인 nearBybookmarksS: ', nearBybookmarksS);
      if (!nearBybookmarksS || nearBybookmarksS.length === 0) {
        console.log(`❌ 5m 이내에 서브업적 북마크 없음.`);
      } else {
        for (const bookmark of nearBybookmarksS) {
          console.log(
            `🎉 이벤트 실행: 유저 ${user_id}가 서브 업적 북마크 [${bookmark.title}] 주변에 진입했습니다.`,
          );
          try {
            await this.APService.post(user_id, bookmark.id);
          } catch (error) {
            console.error('❌ 업적P 완료 처리 실패:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Sub업적 처리 실패:', error);
    }

    /*🎀 핑크몽 */
    try {
      const nearBybookmarkP = await this.geoService.getNearbyBookmarkP(
        latitude,
        longitude,
      );

      if (nearBybookmarkP) {
        console.log(
          `이벤트 실행: 유저 ${user_id}가 북마크 [${nearBybookmarkP.title}] 주변에 진입했습니다.`,
        );
        // 변경됨: 팝업을 즉시 전송하고, 2분 후에 재전송하는 재귀 함수 사용
        const sendPopupRecursively = () => {
          this.directionGateway.sendPopup(
            client,
            user_id,
            `핑크몽 [${nearBybookmarkP.title}]에 접근했습니다!`,
          );
          setTimeout(sendPopupRecursively, 120000); // 2분 후에 재호출
        };
        sendPopupRecursively();
        try {
          const response = await axios.post(
            'http://localhost:3000/catch-pinkmong/catchpinkmong',
            {
              user_id,
              bookmark: nearBybookmarkP,
            },
          );
          console.log(`핑크몽 API 호출 성공:`, response.data);
        } catch (error) {
          console.error(
            `핑크몽 API 호출 실패 (테마: ${nearBybookmarkP.region_theme}):`,
          );
        }

        return { triggered: true, bookmark: nearBybookmarkP }; // [변경됨]: 단일 북마크 반환
      } else {
        console.log(
          `유저 ${user_id}는 핑크몽 북마크 주변 5m 범위에 진입하지 않았습니다.`,
        );

        return { triggered: false };
      }
    } catch (error) {
      console.error('❌ 핑크몽 처리 실패:', error);
    }
  }
}
