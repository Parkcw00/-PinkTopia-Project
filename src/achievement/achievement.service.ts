import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ParseIntPipe,
} from '@nestjs/common';
import { format } from 'date-fns'; // npm install date-fns
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DeleteResult, MoreThan } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { parseISO } from 'date-fns';
import { AchievementCategory } from './enums/achievement-category.enum'; // ENUM 경로 확인
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { AchievementRepository } from './achievement.repository';
import { fixresArr, fixres } from './utils/format';
import { Achievement } from './entities/achievement.entity';
@Injectable()
export class AchievementService {
  constructor(
    private readonly repository: AchievementRepository,
    private readonly s3Service: S3Service,
  ) {}

  // 생성
  async create(
    createAchievementDto: CreateAchievementDto,
    files: Express.Multer.File[], // 여러 파일을 받도록 수정
  ): Promise<Achievement> {
    if (!createAchievementDto || !createAchievementDto.title) {
      throw new BadRequestException('올바른 데이터를 입력하세요.');
    }
    // title로 검색 -> 겹치나 확인
    const alreadyExists = await this.repository.findByTitle(
      createAchievementDto.title,
    );
    // 있으면 throw
    if (alreadyExists) {
      throw new NotFoundException(`이미 있는 업적 이름 입니다.`);
    }
    // 새로운 엔티티 생성

    const achievement_images = await this.s3Service.uploadFiles(files);
    const { title, category, reward, content, expiration_at } =
      createAchievementDto;

    // category 값 Enum 변환
    const validCategory = Object.values(AchievementCategory).includes(
      category as AchievementCategory,
    )
      ? (category as AchievementCategory)
      : null;

    if (!validCategory) {
      throw new BadRequestException(
        `잘못된 category 값입니다. (가능한 값: ${Object.values(AchievementCategory).join(', ')})`,
      );
    }

    // expiration_date를 Date 객체로 변환
    const expirationAt = expiration_at ? format(expiration_at, 'yyyy-MM-dd HH:mm:ss') : undefined;

    const achievement = await this.repository.create({
      title,
      category: validCategory,
      reward,
      achievement_images: achievement_images,
      content,
      expiration_at: expirationAt,
    });

    // console.log('생성 서비스2' + { ...achievement });

    if (!achievement) {
      throw new NotFoundException(`업적 생성 실패`);
    }

    // 데이터베이스에 저장 -> 레포지토리에서 함
    // const save = await this.repository.save(achievement);

    return fixres(achievement); // ✅ 함수 실행
  }

  // 전체
  async findAll(): Promise<Achievement[]> {
    const data = await this.repository.findAll();
    if (!data) {
      throw new NotFoundException(`등록된 업적이 없습니다.`);
    }
    return fixresArr(data);
  }

  // 만료목록
  async findAllDone(userId: number): Promise<Achievement[]> {
    // 현재 UTC 기준 시간 가져오기
    // const now = new Date();
    // console.log('날짜', now);

    // 활성화된 업적 조회
    const data = await this.repository.findAllDone(userId);

    // 결과가 없을 경우 예외 처리
    if (data.length === 0) {
      throw new NotFoundException('활성화된 업적이 없습니다.');
    }

    return data;
  }

  // 활성목록
  async findAllActive(): Promise<Achievement[]> {
    // 현재 UTC 기준 시간 가져오기
    const now = new Date();

    // 활성화된 업적 조회
    const data = await this.repository.findAllActive(now);

    // 결과가 없을 경우 예외 처리
    if (data.length === 0) {
      throw new NotFoundException('활성화된 업적이 없습니다.');
    }
    return data;
  }

  // 카테고리별 조회
  async findCategory(category: string): Promise<Achievement[]> {
    // category 값 Enum 변환
    const validCategory = Object.values(AchievementCategory).includes(
      category as AchievementCategory,
    )
      ? (category as AchievementCategory)
      : null;

    if (!validCategory) {
      throw new BadRequestException(
        `잘못된 category 값입니다. (가능한 값: ${Object.values(AchievementCategory).join(', ')})`,
      );
    }

    const data = await this.repository.findCategory(validCategory); //({ where: { category } });
    if (!data || data.length < 1) {
      throw new NotFoundException(
        `"${validCategory}" 카테고리에 해당하는 업적이 없습니다.`,
      );
    }
    return data;
  }

  async findOne(
    id: string,
  ): Promise<{ title: string; subAchievements: SubAchievement[] }> {
    console.log('id : ', id);
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException(
        'achievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }
    console.log('idA : ', idA);

    // 업적 조회 - 타이틀 가져오기
    const achievement = await this.repository.findOne(idA);
    if (!achievement) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 업적을 찾을 수 없습니다.`,
      );
    }
    console.log('업적 : ', achievement);

    // 서브업적 조회
    const subAchievement = await this.repository.findByAId(idA);
    if (!subAchievement) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 업적을 찾을 수 없습니다.`,
      );
    }

    console.log('서브 업적 : ', subAchievement);
    return {
      title: achievement.title,
      subAchievements: subAchievement ?? [], // null이면 빈 배열 반환
    };
  }

  // userId를 받아 서브업적의 완료 상태를 포함한 업적 정보를 반환하는 새로운 메서드
  async getAchievementWithSubAchievements(
    id: string,
    userId: number,
  ): Promise<{ title: string; subAchievements: any[] }> {
    console.log('id : ', id);
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException(
        'achievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }

    // 업적 조회 - 타이틀 가져오기
    const achievement = await this.repository.findOne(idA);
    if (!achievement) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 업적을 찾을 수 없습니다.`,
      );
    }

    // 서브업적 조회
    const subAchievements = await this.repository.findByAId(idA);
    if (!subAchievements) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 서브업적을 찾을 수 없습니다.`,
      );
    }

    // 사용자가 완료한 서브업적 목록 조회
    // achievement_p 테이블에서 user_id와 achievement_id가 일치하고 complete=1인 항목을 조회
    const completedSubAchievements = await this.repository.findCompletedSubAchievements(userId, idA);
    
    // 완료된 서브업적 ID 목록 생성
    const completedSubIds = completedSubAchievements.map(item => item.sub_achievement_id);

    // 완료 상태를 포함한 서브업적 목록 생성
    const subAchievementsWithStatus = subAchievements.map(sub => ({
      ...sub,
      completed: completedSubIds.includes(sub.id) // completed 속성 추가
    }));

    console.log('서브 업적 (완료 상태 포함): ', subAchievementsWithStatus);
    
    return {
      title: achievement.title,
      subAchievements: subAchievementsWithStatus
    };
  }

  async update(
    id: string,
    updateAchievementDto: UpdateAchievementDto,
    files?: Express.Multer.File[],
  ): Promise<[{ message: string }, Achievement]> {
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException(
        'achievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }
    // id에 따른 데이터가 있는지 확인
    const isExists = await this.repository.findOne(idA);
    if (!isExists) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 업적이 존재하지 않습니다.`,
      );
    }
    if (
      !updateAchievementDto ||
      Object.keys(updateAchievementDto).length === 0
    ) {
      throw new BadRequestException('수정할 데이터를 입력하세요.');
    }
    // 새로운 title이 존재하는지 확인 (자기 자신 제외)
    if (updateAchievementDto.title) {
      const duplicateTitle = await this.repository.findByTitle(
        updateAchievementDto.title,
      );
      if (duplicateTitle && duplicateTitle.id !== idA) {
        throw new ConflictException(
          `"${updateAchievementDto.title}" 제목의 업적이 이미 존재합니다.`,
        );
      }
    }

    const {
      title,
      category: validCategory,
      reward,
      content,
      expiration_at,
    } = updateAchievementDto;

    //   achievement_images,

    // 기존 이미지 배열을 기본값으로 사용
    let imageUrls = isExists.achievement_images;

    if (files && files.length > 0) {
      // 새 이미지가 있을 경우 기존 이미지 삭제
      if (
        isExists.achievement_images &&
        isExists.achievement_images.length > 0
      ) {
        for (const imgUrl of isExists.achievement_images) {
          const key = imgUrl.split('/').pop();
          if (key) {
            try {
              await this.s3Service.deleteFile(key);
            } catch (error) {
              console.error(`Failed to delete image from S3: ${error.message}`);
            }
          }
        }
      }
      // 새 이미지 업로드 후 URL 획득
      imageUrls = await this.s3Service.uploadFiles(files);
    }

    const updateData = {
      title,
      category: validCategory,
      reward,
      content,
      achievement_images: imageUrls,
      expiration_at,
    };

    // 업데이트 수행
    await this.repository.update(idA, updateData);
    const updatedData = await this.repository.findOne(idA);
    if (!updatedData) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 업적을 확인할 수 없습니다.`,
      );
    }

    return [{ message: '수정 성공' }, updatedData];
  }

  // 소프트 삭제
  async remove(id: string): Promise<{ message: string }> {
    const idA = Number(id);
    console.log('id 형변환');
    if (!idA) {
      throw new BadRequestException(
        'achievementId 값이 없거나 형식이 맞지 않습니다',
      );
    }

    await this.repository.softDelete(idA);
    console.log('삭제');
    const isExists = await this.repository.findOne(idA);
    if (isExists) {
      throw new NotFoundException(`삭제 실패`);
    }
    console.log('여기까지 오긴 왔네');
    return { message: '삭제 성공' };
  }
}
