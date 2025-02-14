import {Injectable } from '@nestjs/common';
import { IsNull,Repository,MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubAchievement } from './entities/sub-achievement.entity'
import {CreateSubAchievementDto}from './dto/create-sub-achievement.dto'
import {UpdateSubAchievementDto} from './dto/update-sub-achievement.dto'
import { promises } from 'dns';
@Injectable()
export class SubAchievementRepository {
  constructor(
      @InjectRepository(SubAchievement)
      private readonly entity: Repository<SubAchievement>,
  ) {  }



      // 생성
    // 타이틀로로 조회
    async findByTitle(title:string): Promise<SubAchievement | null>{
      return await this.entity.findOne({ where: { title } });
    }
    // create()는 데이터베이스에 저장하지 않고 단순히 엔터티 인스턴스만 생성
    async create(createSubAchievementDto:CreateSubAchievementDto): Promise<SubAchievement | null>{
      return this.entity.create(createSubAchievementDto)
    }
    // 반드시 save()를 호출해야 데이터베이스에 저장됨.
    async save(data: SubAchievement): Promise<SubAchievement> {
    return await this.entity.save(data);
    }
  
    // 조회
    async findOne(id:number): Promise<SubAchievement | null>{
      return await this.entity.findOne({ where: { id } });
    }

// 수정 
async update(id:number, updateSubAchievementDto:UpdateSubAchievementDto): Promise<void>{
  await this.entity.update(id, updateSubAchievementDto)
}

// softDelete
async softDelete(id: number): Promise<void> {
  await this.entity.update(id, { deleted_at: new Date() });
}

}
