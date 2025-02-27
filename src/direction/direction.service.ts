import { Injectable, NotFoundException } from '@nestjs/common';
import { ValkeyService } from '../valkey/valkey.service';
import { AchievementPService } from '../achievement-p/achievement-p.service';
import { CompareDirection } from './dto/compare-direction.dto';
import { getDistance, isPointWithinRadius } from 'geolib';
import axios, { all } from 'axios'; // HTTP 요청을 보내기 위한 클라이언트 라이브러리

import { number } from 'joi';

@Injectable()
export class DirectionService {
  constructor(
    private readonly valkeyService: ValkeyService,
    private readonly APService: AchievementPService,
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

    // console.log(`왔음`);
    //console.log({ bookmarksS, bookmarksP });
    return { bookmarksS, bookmarksP };
  }

  //발키 P,S 읽어오기
  // 사용자와 거리가 5m 이내인 경우 목록만들기 이벤트S 실행
  //   유저id에 연결된 업적P 목록과 겹치지 않는지 확인. 겹치면 throw, 없으면 업적P에 추가, 알림창 보이기
  // 사용자와 거리가 5m 이내인 경우 이벤트P 실행
  //   핑크몽 캡처 이벤트 실행하고 여기는 종료. 이미 실행됬으면 중복 실행되지 않게

  async compareBookmark(user_id: number, compareDirection: CompareDirection) {
    const { user_direction /*, bookmark_direction */ } = compareDirection;

    /** Sub업적 */
    try {
      // 서브업적 키만 가져옴

      // 반복문 돌면서 키값으로 데이터 읽어오기  -   5m 이내인 경우만

      /** 서브 업적 키 조회 */

      /** 서브 업적 키 조회 */
      const keysS: string[] =
        await this.valkeyService.getKeysByPattern(`sub-achievement:*`);
      console.log('🔍 keyssS 확인:', keysS);

      if (!keysS || keysS.length < 1) {
        throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
      }
      // 병렬로 데이터 가져오기
      const allData = await Promise.all(
        keysS.map((key) => this.valkeyService.get(key)),
      );

      // 5m 이내의 북마커 필터링
      let nearBybookmarksS = allData.flat();
      nearBybookmarksS = nearBybookmarksS.filter((bookmark: any) => {
        if (!bookmark.latitude || !bookmark.longitude) return false;
        console.log('===========================');
        console.log(user_direction.latitude);
        console.log(user_direction.longitude);
        console.log('===========================');
        console.log(bookmark.latitude);
        console.log(bookmark.longitude);
        console.log('===========================');

        const result1 = getDistance(
          {
            latitude: user_direction.latitude,
            longitude: user_direction.longitude,
          },
          {
            latitude: Number(bookmark.latitude),
            longitude: Number(bookmark.longitude),
          }, // 반경 5m 내에 있는지 체크
        );
        console.log('거리', result1);
        const result = isPointWithinRadius(
          {
            latitude: user_direction.latitude,
            longitude: user_direction.longitude,
          },
          {
            latitude: Number(bookmark.latitude),
            longitude: Number(bookmark.longitude),
          },
          5, // 반경 5m 내에 있는지 체크
        );
        console.log('결과', result);
        return result;
      });
      console.log('nearBybookmarksS1', nearBybookmarksS);

      // 이벤트 실행: 각 서브 업적에 대해 AchievementPService 호출
      if (nearBybookmarksS.length >= 1) {
        // [변경됨]: forEach 내부를 async 함수로 변경하여 APService 호출
        nearBybookmarksS.forEach(async (bookmark: any) => {
          console.log(
            `이벤트 실행: 유저 ${user_id}가 서브 업적 북마크 [${bookmark.title}] 주변에 진입했습니다.`,
          );
          console.log('bookmark', bookmark);
          try {
            await this.APService.post(user_id, bookmark.id);
          } catch (error) {
            console.error('❌ 업적P 완료 처리 실패:', error);
          }
        });
      }
    } catch (error) {
      console.error('❌ Sub업적 처리 실패:', error);
    }

    /** 핑크몽 */

    try {
      /** 핑크몽 위치 키 조회 */ /** 핑크몽 위치 키 조회 */
      const keysP: string[] = await this.valkeyService.getKeysByPattern(
        `pinkmong-appear-location:*`,
      );
      console.log('🔍 keyssS 확인:', keysP);

      if (!keysP || keysP.length < 1) {
        throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
      }

      // 병렬로 데이터 가져오기
      const allData = await Promise.all(
        keysP.map((key) => this.valkeyService.getString(key)),
      );
      console.clear();
      console.log('allData', allData);
      // 5m 이내의 북마커 중 가장 가까운 것 하나만 반환
      let nearestBookmarkP: any = allData.flat(); // 중첩 배열을 단일 배열로 변환
      console.log('nearestBookmarkP1', nearestBookmarkP);
      nearestBookmarkP = nearestBookmarkP.filter((bookmark: any) => {
        bookmark = JSON.parse(bookmark); // JSON.parse 하나를 객체로 만들려고 하는거 //왜안되는지 찾으쇼
        if (bookmark.latitude && bookmark.longitude) {
          return bookmark;
        }
      }); // 유효한 데이터 필터링
      console.log('nearestBookmarkP2', nearestBookmarkP);
      nearestBookmarkP = nearestBookmarkP.map((bookmark: any) => {
        bookmark = JSON.parse(bookmark);
        console.log('=================================================');
        console.log('user_direction.latitude', user_direction.latitude);
        console.log('user_direction.longitude', user_direction.longitude);
        console.log('=================================================');
        console.log('bookmark.latitude', bookmark.latitude);
        console.log('bookmark.longitude', bookmark.longitude);
        console.log('=================================================');
        const distance = getDistance(
          {
            latitude: user_direction.latitude,
            longitude: user_direction.longitude,
          },
          {
            latitude: parseFloat(bookmark.latitude),
            longitude: parseFloat(bookmark.longitude),
          },
        );
        console.log('bookmark', bookmark, typeof bookmark);
        console.log('distance', distance);
        const test = { ...bookmark };
        console.log('test', test);
        return { ...bookmark, distance };
      });
      console.log('nearestBookmarkP3', nearestBookmarkP);
      nearestBookmarkP = nearestBookmarkP
        .filter((bookmark) => bookmark.distance <= 5) // 5m 이내만 필터링
        .sort((a, b) => a.distance - b.distance) // 가장 가까운 순으로 정렬
        .at(0); // 가장 가까운 하나만 가져오기

      console.log('결과:', nearestBookmarkP);

      // 이벤트 실행
      // 5m 이내 북마크가 있으면 해당 테마에 맞는 캐치핑크몽 API 호출
      // 이벤트 실행: 북마크 주변 5m 내에 있을 경우
      // nearBybookmarksP에서 가장 가까운 북마크를 선택한 후
      if (nearestBookmarkP) {
        console.log(
          `이벤트 실행: 유저 ${user_id}가 북마크 [${nearestBookmarkP.title}] 주변에 진입했습니다.`,
        );
        if (nearestBookmarkP.region_theme) {
          try {
            // 여기서 웹소켓 메시지에서 받은 데이터를 payload에 담아 POST 요청 수행
            const payload = {
              user_id, // 예: user_id가 이미 존재하는 변수
              region_theme: nearestBookmarkP.region_theme, // 웹소켓으로 받은 데이터 내 테마 값
              bookmark: nearestBookmarkP, // 전체 북마크 데이터 전달
            };

            const response = await axios.post(
              'http://localhost:3000/catch-pinkmong/catchpinkmong',
              payload,
            );
            console.log(
              `핑크몽 API 호출 성공 (테마: ${nearestBookmarkP.region_theme}):`,
              response.data,
            );
          } catch (error) {
            console.error(
              `핑크몽 API 호출 실패 (테마: ${nearestBookmarkP.region_theme}):`,
              error,
            );
          }
        } else {
          console.log(
            `북마크 [${nearestBookmarkP.title}]에 테마 정보가 없습니다.`,
          );
        }
        return { triggered: true, bookmark: nearestBookmarkP };
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
