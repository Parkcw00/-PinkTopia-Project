import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
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
import { QueryRunner, Repository } from 'typeorm'; // TypeORM Repository
import { DataSource } from 'typeorm';
@Injectable()
export class AchievementPService {
  private readonly logger = new Logger(AchievementPService.name); // ✅ Logger 추가
  constructor(
    private readonly repository: AchievementPRepository,
    private readonly valkeyService: ValkeyService,
    private readonly dataSource: DataSource, // ✅ DataSource 주입
  ) {}
  /*
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
    const createP = await this.repository.createP(dataP);
    console.log('createP', createP);
    if (!createP) {
      console.log('P생성실패');
      throw new BadRequestException('P생성 실패했습니다.');
    }

    const save = await this.repository.save(createP);
    if (!save) {
      console.log('P save 실패');
      throw new BadRequestException('P저장 실패했습니다.');
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
  /*
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
  }*/

  async post(user_id: number, subId: number): Promise<AchievementP> {
    if (isNaN(Number(user_id)) || isNaN(Number(subId))) {
      throw new BadRequestException('user_id와 subId는 숫자여야 합니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // subId가 유효한지 확인
      const subAchievementRepo =
        queryRunner.manager.getRepository(AchievementP);
      const isSubId = await subAchievementRepo.findOne({
        where: { id: subId },
      });

      if (!isSubId) {
        throw new NotFoundException('해당 서브업적이 존재하지 않습니다.');
      }

      // 이미 달성한 항목인지 확인
      const alreadyP = await subAchievementRepo.findOne({
        where: { user_id, sub_achievement_id: subId },
      });

      if (alreadyP) {
        throw new BadRequestException('이미 달성한 서브업적 입니다.');
      }

      // 업적 데이터 생성 및 저장
      const newAchievementP = subAchievementRepo.create({
        user_id,
        sub_achievement_id: subId,
        achievement_id: isSubId.achievement_id ?? null,
        complete: true,
      });

      const savedAchievementP = await subAchievementRepo.save(newAchievementP);
      if (!savedAchievementP) {
        throw new BadRequestException('업적 저장 실패');
      }

      // 서브 업적 목록 조회
      const subAchievementList = await subAchievementRepo.find({
        where: { achievement_id: isSubId.achievement_id },
      });

      if (!subAchievementList || subAchievementList.length < 1) {
        throw new BadRequestException('서브 업적 목록 조회 실패');
      }

      // 완료된 업적 P 목록 조회
      const achievementPList = await subAchievementRepo.find({
        where: { achievement_id: isSubId.achievement_id, user_id },
      });

      if (!achievementPList || achievementPList.length < 1) {
        throw new BadRequestException('P-서브목록 조회 실패');
      }

      // 업적 완료 여부 확인 및 처리
      if (subAchievementList.length === achievementPList.length) {
        const isMatching = subAchievementList.every((sub) =>
          achievementPList.some(
            (achieved) => achieved.sub_achievement_id === sub.id,
          ),
        );

        if (isMatching) {
          // 업적C 테이블에 추가
          const achievementCRepo =
            queryRunner.manager.getRepository(AchievementP);
          const newAchievementC = achievementCRepo.create({
            user_id,
            achievement_id: isSubId.achievement_id,
          });

          await achievementCRepo.save(newAchievementC);

          // ✅ `Achievement` 테이블에서 `reward` 조회
          const rewardData = await queryRunner.manager
            .getRepository(Achievement)
            .findOne({ where: { id: isSubId.achievement_id } });

          if (!rewardData || !rewardData.reward) {
            throw new BadRequestException('보상 데이터를 찾을 수 없습니다.');
          }

          const reward = JSON.parse(rewardData.reward); // ✅ `reward` 필드가 JSON이라면 파싱 필요
          const { gem, dia } = reward;

          if (isNaN(gem) || gem <= 0) {
            throw new BadRequestException('유효하지 않은 gem 값');
          }
          await queryRunner.manager
            .getRepository(AchievementP)
            .increment({ user_id }, 'pink_gem', gem);

          if (isNaN(dia) || dia <= 0) {
            throw new BadRequestException('유효하지 않은 dia 값');
          }
          await queryRunner.manager
            .getRepository(AchievementP)
            .increment({ user_id }, 'pink_dia', dia);

          this.logger.log(
            `핑크다이아 ${dia}개와 핑크젬 ${gem}개가 지급되었습니다.`,
          );
        }
      }

      // 트랜잭션 커밋
      await queryRunner.commitTransaction();
      return savedAchievementP;
    } catch (error) {
      // 에러 발생 시 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 쿼리 러너 해제
      await queryRunner.release();
    }
  }

  async deleteByUserNSub(
    user_id: number,
    subId: number,
  ): Promise<{ message: string }> {
    if (isNaN(Number(user_id)) || isNaN(Number(subId))) {
      throw new BadRequestException('user_id와 subId는 숫자여야 합니다.');
    }

    const alreadyP = await this.repository.findPByUserNSub(user_id, subId);
    if (!alreadyP) {
      throw new NotFoundException('해당 항목이 없습니다.');
    }

    await this.repository.delete(alreadyP.id);
    return { message: '삭제 완료' };
  }

  async deleteByPId(achievementPId: string): Promise<{ message: string }> {
    const idP = Number(achievementPId);
    if (isNaN(idP)) {
      throw new BadRequestException('achievementPId는 숫자여야 합니다.');
    }

    await this.repository.delete(idP);
    return { message: '삭제 완료' };
  }
}
