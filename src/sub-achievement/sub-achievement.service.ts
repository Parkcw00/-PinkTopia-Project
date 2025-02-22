import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';
import { format, parseISO, isValid } from 'date-fns';
import { SubAchievementRepository } from './sub-achievement.repository';
import { SubAchievement } from './entities/sub-achievement.entity';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';
import { fixresArr, fixres } from './utils/format';

import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { Repository } from 'typeorm'; // TypeORM Repository
import { InjectRepository } from '@nestjs/typeorm'; // TypeORM 의존성 주입

@Injectable()
export class SubAchievementService {
  constructor(
    private readonly repository: SubAchievementRepository,
    private readonly s3Service: S3Service,
    private readonly valkeyService: ValkeyService,
  ) {}

  async fillValkey() {
    // 1. DB에서 모든 서브업적 가져오기
    const dbSub: SubAchievement[] = await this.repository.getAll();

    if (!dbSub || dbSub.length === 0) {
      throw new NotFoundException('DB에 서브업적 데이터가 없습니다.');
    }

    // 2. Redis에 일괄 저장 (Pipeline 사용)
    const pipeline = this.valkeyService.getClient().pipeline();
    if (!pipeline) {
      throw new NotFoundException('Valkey(Pipeline)를 가져올 수 없습니다.');
    }

    for (const sub of dbSub) {
      const key = `sub-achievement:${sub.id}`; // 고유 ID 사용

      const subData = {
        id: sub.id,
        achievement_id: sub.achievement_id,
        title: sub.title,
        longitude: sub.longitude,
        latitude: sub.latitude,
        sub_achievement_images: sub.sub_achievement_images,
        mission_type: sub.mission_type,
        expiration_at: sub.expiration_at?.toISOString() || null,
        created_at: sub.created_at?.toISOString() || null,
        updated_at: sub.updated_at?.toISOString() || null,
      };

      pipeline.set(key, JSON.stringify(subData)); // Redis에 저장
    }

    await pipeline.exec(); // 🚀 일괄 실행 (반드시 await 사용)

    console.log(`✅ ${dbSub.length}개의 서브업적이 Valkey에 저장되었습니다.`);
    return {
      message: `✅ ${dbSub.length}개의 서브업적이 Valkey에 저장되었습니다.`,
    };
  }

  async create(
    createSubAchievementDto: CreateSubAchievementDto,
    files: Express.Multer.File[],
  ): Promise<{ subAchievement: SubAchievement }> {
    if (
      !createSubAchievementDto ||
      !createSubAchievementDto.title ||
      !createSubAchievementDto.achievement_id
    ) {
      throw new BadRequestException('올바른 데이터를 입력하세요.');
    }
    // DTO에서 값 추출
    const {
      achievement_id,
      title,
      mission_type,
      longitude,
      latitude,
      expiration_at,
    } = createSubAchievementDto;

    // achievement_id가 숫자인지 확인
    const idA = Number(achievement_id);
    if (isNaN(idA)) {
      throw new BadRequestException('achievement_id는 숫자여야 합니다.');
    }

    // title 중복 체크
    const alreadyExists = await this.valkeyService.get(`title:${title}`);
    if (alreadyExists) {
      throw new NotFoundException('이미 있는 업적 이름입니다.');
    }
    //  mission_type 값 Enum 변환
    const valid_mission_type = Object.values(
      SubAchievementMissionType,
    ).includes(mission_type as SubAchievementMissionType)
      ? (mission_type as SubAchievementMissionType)
      : null;

    if (!valid_mission_type) {
      throw new BadRequestException(
        `잘못된 mission_type 값입니다. (가능한 값: ${Object.values(SubAchievementMissionType).join(', ')})`,
      );
    }

    //  expiration_at을 Date 객체로 변환 및 유효성 검사
    let expirationAt: Date | null = null;
    if (expiration_at) {
      const parsedDate =
        typeof expiration_at === 'string'
          ? parseISO(expiration_at)
          : expiration_at;
      if (!isValid(parsedDate)) {
        throw new BadRequestException('유효하지 않은 expiration_at 값입니다.');
      }
      expirationAt = parsedDate;
    }
    //  새로운 엔티티 생성

    const sub_achievement_images = await this.s3Service.uploadFiles(files);

    const createSub = `achievement_id: ${achievement_id}, // ✅ 관계 매핑
      expiration_at: expirationAt ?? undefined, // ✅ null → undefined 변환
      title:${title},
      sub_achievement_images:${sub_achievement_images},
      longitude:${longitude},
      latitude:${latitude},
      mission_type:${valid_mission_type}`;

    const subAchievementV = await this.valkeyService.get(createSub);

    const subAchievement = await this.repository.create({
      achievement_id: achievement_id, // ✅ 관계 매핑
      expiration_at: expirationAt ?? undefined, // ✅ null → undefined 변환
      title,
      sub_achievement_images,
      longitude,
      latitude,
      mission_type: valid_mission_type,
    });

    //  DB 저장
    const save = await this.repository.save(subAchievement);

    // achievement_id가 일치하는 모든 데이터를 achievement_c 테이블에서 삭제하기
    // const delete_achievement_c  =
    await this.repository.delete_achievement_c(achievement_id);
    return { subAchievement: save };
    // return fixres(save);
  }

  async findOne(id: string) {
    //: Promise<SubAchievement> {
    const idS = Number(id);
    if (!idS) {
      throw new BadRequestException(
        'subAchievementId 값이 없거나 잘못된 형식 입니다',
      );
    }

    const data = await this.valkeyService.get(`id:${id}`);
    //const data = await this.repository.findOne(idS);
    if (!data) {
      throw new NotFoundException(
        `ID ${idS}에 해당하는 업적을 찾을 수 없습니다.`,
      );
    }
    return data;
  }

  // async update(
  //   id: string,
  //   updateSubAchievementDto: UpdateSubAchievementDto,
  // ){//: Promise<[{ message: string }, SubAchievement]> {
  //   const idS = Number(id);
  //   if (!idS) {
  //     throw new BadRequestException(
  //       'achievementId 값이 없거나 형식이 맞지 않습니다',
  //     );
  //   }
  //   // id에 따른 데이터가 있는지 확인

  //   const isExists = await this.valkeyService.get(`id:${idS}`);
  //   //const isExists = await this.repository.findOne(idS);
  //   if (!isExists) {
  //     throw new NotFoundException(
  //       `ID ${idS}에 해당하는 업적이 존재하지 않습니다.`,
  //     );
  //   }
  //   if (
  //     !updateSubAchievementDto ||
  //     Object.keys(updateSubAchievementDto).length === 0
  //   ) {
  //     throw new BadRequestException('수정할 데이터를 입력하세요.');
  //   }

  //   const { expiration_at, achievement_id, title, conditions, mission_type } =
  //   updateSubAchievementDto;
  //   await valkeyService.set(`id:${idS}`, {`expiration_at:${expiration_at}, achievement_id:${achievement_id}, title:${ title}, conditions:${conditions}, mission_type:${mission_type}`});

  //   await this.repository.update(idS, updateSubAchievementDto);

  //   // 수정여부를 확인하는 처리...
  //   const data = await this.valkeyService.get(`id:${idS}`);
  //  // const data = await this.repository.findOne(idS);
  //   if (!data) {
  //     throw new NotFoundException(
  //       `ID ${id}에 해당하는 업적을 확인인할 수 없습니다.`,
  //     );
  //   }

  //   return [{ message: '서브업적 수정 성공' }, data];
  // }

  // 소프트삭제

  async update(id: string, updateSubAchievementDto: UpdateSubAchievementDto) {
    const idS = Number(id);
    if (isNaN(idS)) {
      throw new BadRequestException(
        'achievementId 값이 없거나 형식이 맞지 않습니다.',
      );
    }

    // 1️⃣ Valkey에서 기존 데이터 확인 (캐싱된 데이터 활용)
    let isExists = await this.valkeyService.get(`id:${idS}`);

    if (!isExists) {
      // Valkey에 없으면 DB에서 조회
      isExists = await this.repository.findOne(idS);
      if (!isExists) {
        throw new NotFoundException(
          `ID ${idS}에 해당하는 업적이 존재하지 않습니다.`,
        );
      }
    }

    if (
      !updateSubAchievementDto ||
      Object.keys(updateSubAchievementDto).length === 0
    ) {
      throw new BadRequestException('수정할 데이터를 입력하세요.');
    }

    // 2️⃣ DB 업데이트 실행
    await this.repository.update(idS, updateSubAchievementDto);

    // 3️⃣ Valkey 데이터 동기화 (DB 최신 데이터를 다시 캐시에 저장)
    const updatedData = await this.repository.findOne(idS);
    if (!updatedData) {
      throw new NotFoundException(
        `ID ${idS}에 해당하는 업적을 확인할 수 없습니다.`,
      );
    }

    await this.valkeyService.set(`id:${idS}`, JSON.stringify(updatedData));

    return [{ message: '서브업적 수정 성공' }, updatedData];
  }

  // async softDelete(id: string) {
  //   const idS = Number(id);
  //   if (!idS) {
  //     throw new BadRequestException(
  //       'subAchievementId 값이 없거나 타이에 맞지 않습니다',
  //     );
  //   }
  //   // id와 일치하는 값 있는지 확인
  //   const findId = await this.repository.findOne(idS);
  //   if (!findId) {
  //     throw new NotFoundException('존재하지 않는 서브업적 입니다.');
  //   }
  //   // softDelete
  //   await this.repository.softDelete(idS);
  //   // 수정 확인
  //   // id와 일치하는 값 있는지 확인
  //   const isdelete = await this.repository.findOne(idS);
  //   if (!isdelete?.deleted_at) {
  //     throw new NotFoundException('서브업적 softDelete실패');
  //   }
  //   return { message: '삭제 성공' };
  // }

  async softDelete(id: string) {
    const idS = Number(id);
    if (isNaN(idS)) {
      throw new BadRequestException(
        'subAchievementId 값이 없거나 형식이 맞지 않습니다.',
      );
    }

    // 1️⃣ Valkey & DB에서 데이터 확인
    let findId = await this.valkeyService.get(`id:${idS}`);

    if (!findId) {
      findId = await this.repository.findOne(idS);
      if (!findId) {
        throw new NotFoundException('존재하지 않는 서브업적입니다.');
      }
    }

    // 2️⃣ Valkey에서 먼저 삭제
    await this.valkeyService.del(`id:${idS}`);

    // 3️⃣ DB에서 Soft Delete 실행
    await this.repository.softDelete(idS);

    // 4️⃣ 삭제 여부 확인 (DB에서 `deleted_at` 필드 체크)
    const isDeleted = await this.repository.findOne(idS);
    if (isDeleted) {
      throw new NotFoundException('서브업적 softDelete 실패');
    }

    return { message: '삭제 성공' };
  }
}
