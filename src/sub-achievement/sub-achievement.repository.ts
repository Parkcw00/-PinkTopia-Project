import { Injectable } from '@nestjs/common';
import { IsNull, Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubAchievement } from './entities/sub-achievement.entity';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';
import { promises } from 'dns';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';

import { AchievementC } from '../achievement-c/entities/achievement-c.entity';

@Injectable()
export class SubAchievementRepository {
  constructor(
    @InjectRepository(SubAchievement)
    private readonly entity: Repository<SubAchievement>,
    @InjectRepository(AchievementC)
    private readonly entityC: Repository<AchievementC>,
  ) {}

  // db에서 다 가져오기
  async getAll(): Promise<SubAchievement[] | []> {
    return await this.entity.find();
  }

  // 생성
  // 타이틀로 조회
  async findByTitle(title: string): Promise<SubAchievement | null> {
    return await this.entity.findOne({ where: { title } });
  }

  // create()는 데이터베이스에 저장하지 않고 엔터티 인스턴스만 생성
  async create(data: Partial<SubAchievement>): Promise<SubAchievement> {
    return this.entity.create(data);
  }
  // 반드시 save()를 호출해야 데이터베이스에 저장됨.
  async save(data: SubAchievement): Promise<SubAchievement> {
    return this.entity.save(data);
  }

  // 완료로 등록된 업적 삭제
  async delete_achievement_c(id: number) {
    // 'achievement'는 삭제 조건에 해당하는 컬럼명입니다.
    return await this.entityC.delete({ achievement_id: id });
  }

  // 조회
  async findOne(id: number): Promise<SubAchievement | null> {
    // where:{ withDeleted: false } 소프트삭제된 데이터 제외
    return await this.entity.findOne({ where: { id }, withDeleted: false });
  }

  // 수정
  async update(
    id: number,
    updateSubAchievementDto: UpdateSubAchievementDto,
  ): Promise<void> {
    await this.entity.update(id, updateSubAchievementDto);
  }

  // softDelete
  async softDelete(id: number): Promise<void> {
    await this.entity.softDelete(id); // ✅ TypeORM 기본 softDelete() 활용
    //await this.entity.update(id, { deleted_at: new Date() });
  }
}
