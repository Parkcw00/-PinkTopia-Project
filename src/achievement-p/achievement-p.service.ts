import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AchievementP } from './entities/achievement-p.entity';
import { AchievementPRepository } from './achievement-p.repository';
import { number } from 'joi';
import { Achievement } from '../achievement/entities/achievement.entity';
import { IsDate } from 'class-validator';

import { ValkeyService } from '../valkey/valkey.service';
import { Repository } from 'typeorm'; // TypeORM Repository
@Injectable()
export class AchievementPService {
  constructor(
    private readonly repository: AchievementPRepository,
    private readonly valkeyService: ValkeyService,
  ) {}

  async fillValkey(user_id: number) {
    if (isNaN(+user_id)) {
      throw new BadRequestException('user_id는 숫자여야 합니다.');
    }
    const APDB = await this.repository.findPByUser(user_id);
    if (!APDB || APDB.length === 0) {
      throw new NotFoundException('DB에 유저의 서브업적 데이터가 없습니다.');
    }
    // 2. Redis에 일괄 저장 (Pipeline 사용)
    const pipeline = this.valkeyService.getClient().pipeline();
    if (!pipeline) {
      throw new NotFoundException('Valkey(Pipeline)를 가져올 수 없습니다.');
    }

    for (const aP of APDB) {
      const key = `achievementP:${aP.id}`; // 고유 ID 사용
      const aPData = {
        id: aP.id,
        user_id: aP.user_id,
        sub_achievement_id: aP.sub_achievement_id,
        achievement_id: aP.achievement_id,
        complete: aP.complete,
      };
      console.log(aPData);

      pipeline.set(key, JSON.stringify(aPData)); // Redis에 저장
    }

    await pipeline.exec(); // 🚀 일괄 실행 (반드시 await 사용)

    console.log(`✅ ${APDB.length}개의 서브업적이 Valkey에 저장되었습니다.`);
    return {
      message: `✅ ${APDB.length}개의 서브업적이 Valkey에 저장되었습니다.`,
    };
  }

  async post(user_id: number, subId: number): Promise<AchievementP> {
    if (!subId) {
      console.log('subId불량');
      throw new BadRequestException(
        'subAchievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }

    // subId와 일치하는 데이터가 있는지 확인
    const isSubId = await this.repository.findSub(subId);
    if (!isSubId) {
      console.log('isSubId불량');
      throw new NotFoundException('해당 서브업적이 존재하지 않습니다.');
    }
    // 이미 있는 항목인지 확인
    const alreadyP = await this.repository.findPByUserNSub(user_id, subId);
    console.log('alreadyP 조회 결과:', alreadyP); // Debugging
    if (alreadyP) {
      throw new BadRequestException('이미 달성한 서브업적 입니다.');
    }

    // 업적 데이터 생성
    const dataP = {
      user_id,
      sub_achievement_id: subId,
      achievement_id: isSubId?.achievement_id ?? null, // 만약 null이면 명확하게 설정
      complete: true,
    };

    // Redis 저장할 키 생성 (고유 ID 자동 생성되므로 따로 안 넣음)
    const key = `achievementP:${subId}:${Date.now()}`;
    console.log('dataP', dataP);
    console.log('key', key);
    // Redis에 저장
    await this.valkeyService.set(key, dataP);
    const createP = await this.repository.createP(dataP);
    console.log('createP', createP);
    if (!createP) {
      console.log('생성실패');
      throw new BadRequestException('생성 실패했습니다.');
    }

    const save = await this.repository.save(createP);
    if (!save) {
      console.log('save 실패');
      throw new BadRequestException('저장 실패했습니다.');
    }
    /*
    // 비교하고 업적C 추가하기
    // 비교 방법
    // 1. 두 배열의 길이 비교(쉬움)
    // 2.  P 안에 subId가다 있는지 검증(정확)
    //      in 함수 사용
    //      includes()
    //      every()
    // javascript in?
    // 서브 배열(sub_id 모음)과 P배열(Pid 모음)의 길이가 같다
    // P배열(Pid 모음)안에 서브 배열(sub_id 모음)이 모두 존재한다
    // 두 조건을 만족한 경우 C에 추가
*/
    // subAhcivment 배열 생성 (subAllByA 결과에서 id만 추출)
    const subAhcivment = (
      await this.repository.subAllByA(isSubId.achievement_id)
    ).map((subId) => subId.id);
    if (!subAhcivment || subAhcivment.length < 1) {
      console.log('s-서브목록조회실패');
      throw new BadRequestException('s-서브목록 조회실패했습니다.');
    }

    // ahcivmentP 배열 생성 (pAllByA 결과에서 sub_achievement_id만 추출)
    const ahcivmentP = (
      await this.repository.pAllByA(isSubId.achievement_id)
    ).map((subId) => subId.sub_achievement_id);
    if (!ahcivmentP || ahcivmentP.length < 1) {
      console.log('P-서브목록조회실패');
      throw new BadRequestException('P-서브목록 조회실패했습니다.');
    }
    // 길이 비교
    if (subAhcivment.length !== ahcivmentP.length) {
      console.log('길이가 다름');
    } else {
      // 모든 subAhcivment 값이 ahcivmentP에 포함되는지 확인
      const isMatching = subAhcivment.every((id) => ahcivmentP.includes(id));

      if (isMatching) {
        console.log('두 배열이 완전히 일치함');
        // 업적C 테이블에 해당 업적 추가
        const dataC = await this.repository.createC({
          user_id,
          achievement_id: isSubId.achievement_id,
        });
        const saveToC = await this.repository.saveC(dataC);
        console.log('업적C에 저장 : ', saveToC);
        /////////////
        // ////////////////////
        // 상품수여
        // 상품 조회  {gem:100, dia:3}
        const reward = await this.repository.reward(isSubId.achievement_id);

        const gem = Number(reward.reward.gem);
        if (!gem) {
          throw new BadRequestException('gem 값이 없거나 형식이 맞지 않습니다');
        }
        await this.repository.gem(user_id, gem);

        const dia = Number(reward.reward.dia);
        if (!dia) {
          throw new BadRequestException('dia 값이 없거나 형식이 맞지 않습니다');
        }
        console.log(``);
        await this.repository.dia(user_id, dia);

        console.log(`핑크다이아 ${dia}개와 핑크젬 ${gem}개가 지급되었습니다.`);
      } else {
        console.log('일치하지 않는 값이 있음');
      }
    }

    // 반환값은 추가한 P
    return save;
  }

  // 삭제
  async deleteByUserNSub(
    user_id: number,
    subId: number,
  ): Promise<{ message: string }> {
    if (!subId) {
      throw new BadRequestException(
        'subAchievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }

    // 이미 있는 항목인지 확인
    const alreadyP = await this.repository.findPByUserNSub(user_id, subId);
    if (!alreadyP) {
      throw new BadRequestException('해당 항목이 없습니다.');
    }
    await this.repository.delete(alreadyP.id);
    return { message: '삭제 완료' };
  }

  async deleteByPId(achievementPId: string): Promise<{ message: string }> {
    const idP = Number(achievementPId);
    if (!idP) {
      throw new BadRequestException(
        'subAchievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }

    await this.repository.delete(idP);
    return { message: '삭제 완료' };
  }
}
