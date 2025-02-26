import { Injectable, NotFoundException } from '@nestjs/common';
import { ValkeyService } from '../valkey/valkey.service';
import { AchievementPService } from '../achievement-p/achievement-p.service';
import { CompareDirection } from './dto/compare-direction.dto';
import { getDistance } from 'geolib';
import axios from 'axios' // HTTP 요청을 보내기 위한 클라이언트 라이브러리

@Injectable()
export class DirectionService {
  constructor(private readonly valkeyService: ValkeyService,private readonly APService: AchievementPService) {}

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
        bookmarksS.push({ subId: data.id,
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

  async compareBookmark(user_id: string, compareDirection: CompareDirection) {
    const { user_direction/*, bookmark_direction */} = compareDirection;
    

    /** Sub업적 */
    try{ 
      // 서브업적 키만 가져옴 

  // 반복문 돌면서 키값으로 데이터 읽어오기  -   5m 이내인 경우만

 
 /** 서브 업적 키 조회 */

    /** 서브 업적 키 조회 */
    const keysS: string[] = await this.valkeyService.getKeysByPattern(`sub-achievement:*`);
    console.log('🔍 keyssS 확인:', keysS);

    if (!keysS || keysS.length < 1) {
      throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
    }
 // 병렬로 데이터 가져오기
 const allData = await Promise.all(keysS.map((key) => this.valkeyService.get(key)));

 // 5m 이내의 북마커 필터링
 const nearBybookmarksS = allData
   .flat() // 중첩 배열을 단일 배열로 변환
   .filter((bookmark:any) => {
     if (!bookmark.latitude || !bookmark.longitude) return false;

     const distance = getDistance(
       { latitude: user_direction[0], longitude: user_direction[1] },
       { latitude: parseFloat(bookmark.latitude), longitude: parseFloat(bookmark.longitude) }
     );
     return distance <= 5;
   });

// 도착위치 배열: nearBybookmarksS;

 // 이벤트 실행

// 반복문으로 업적P 추가 하기 어떤 방법으로 하는 것이 좋을 까?
// 방법 - 유저id : user_id, 서브업적id : nearBybookmarksS배열 안에 -.subId
// 1. api 호출 : localhost:3000/achievement-p/subAchievementId/:subAchievementId
// 2. 업적P의 서비스에서 직접 실행
 // if (nearBybookmarksS.length >= 1) { 
   
  //   try {
  //     // [변경됨]: axios.post 호출 시, payload에 nearBybookmarksS 정보 포함
  //     nearBybookmarksS.forEach({sub} , {
  //       console.log(`이벤트 실행: 유저 ${user_id}가 북마크 [${sub.title}] 주변에 진입했습니다.`);
  
  //     await this.APService.post(user_id, sub.subId);
  // });
 
  //   }catch (error) {
  //     console.error('❌ 업적P 완료료 처리 실패:', error);
  //   }
    
 // 이벤트 실행: 각 서브 업적에 대해 AchievementPService 호출
 if (nearBybookmarksS.length >= 1) {
  // [변경됨]: forEach 내부를 async 함수로 변경하여 APService 호출
  nearBybookmarksS.forEach(async (bookmark: any) => {
    console.log(`이벤트 실행: 유저 ${user_id}가 서브 업적 북마크 [${bookmark.title}] 주변에 진입했습니다.`);
    try {
      await this.APService.post(user_id, bookmark.subId);
    } catch (error) {
      console.error('❌ 업적P 완료 처리 실패:', error);
    }
  });
}
} catch (error) {
console.error('❌ Sub업적 처리 실패:', error);
}


    /** 핑크몽 */

    try{
 /** 핑크몽 위치 키 조회 *//** 핑크몽 위치 키 조회 */
const keysP: string[] = await this.valkeyService.getKeysByPattern(`pinkmong-appear-location:*`);
console.log('🔍 keyssS 확인:', keysP);

if (!keysP || keysP.length < 1) {
  throw new NotFoundException('발키에 서브업적 데이터가 없습니다.');
}

// 병렬로 데이터 가져오기
const allData = await Promise.all(keysP.map((key) => this.valkeyService.get(key)));

// 5m 이내의 북마커 중 가장 가까운 것 하나만 반환
const nearestBookmarkP = allData
  .flat() // 중첩 배열을 단일 배열로 변환
  .filter((bookmark: any) => bookmark.latitude && bookmark.longitude) // 유효한 데이터 필터링
  .map((bookmark: any) => ({
    ...bookmark,
    distance: getDistance(
      { latitude: user_direction[0], longitude: user_direction[1] },
      { latitude: parseFloat(bookmark.latitude), longitude: parseFloat(bookmark.longitude) }
    ),
  }))
  .filter((bookmark) => bookmark.distance <= 5) // 5m 이내만 필터링
  .sort((a, b) => a.distance - b.distance) // 가장 가까운 순으로 정렬
  .at(0); // 가장 가까운 하나만 가져오기

return nearestBookmarkP || null; // 결과 없으면 null 반환

    // 이벤트 실행
// 5m 이내 북마크가 있으면 해당 테마에 맞는 캐치핑크몽 API 호출
if (nearestBookmarkP) {
  console.log(`이벤트 실행: 유저 ${user_id}가 북마크 [${nearestBookmarkP.title}] 주변에 진입했습니다.`);
  if (nearestBookmarkP.region_theme) {
    try {
      // [변경됨]: axios.post 호출 시, payload에 nearestBookmarkP 정보 포함
      const response = await axios.post('http://localhost:3000/catch-pinkmong/catchpinkmong', {
        user_id,
        region_theme: nearestBookmarkP.region_theme, // 'forest', 'desert', 'ocean', 'mountain', 'city'
        bookmark: nearestBookmarkP,
      });
      console.log(`핑크몽 API 호출 성공 (테마: ${nearestBookmarkP.region_theme}):`, response.data);
    } catch (error) {
      console.error(`핑크몽 API 호출 실패 (테마: ${nearestBookmarkP.region_theme}):`, error);
    }
  } else {
    console.log(`북마크 [${nearestBookmarkP.title}]에 테마 정보가 없습니다.`);
  }
  return { triggered: true, bookmark: nearestBookmarkP }; // [변경됨]: 단일 북마크 반환
} else {
  console.log(`유저 ${user_id}는 핑크몽 북마크 주변 5m 범위에 진입하지 않았습니다.`);
  return { triggered: false };
}
}catch (error) {
  console.error('❌ 핑크몽 처리 실패:', error);
}

    
  
}}
