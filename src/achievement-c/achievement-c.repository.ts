import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {AchievementC} from './entities/achievement-c.entity';
import {AchievementP} from '../achievement-p/entities/achievement-p.entity';

@Injectable()
export class AchievementCRepository {
  constructor(
    @InjectRepository(AchievementC)
    private readonly entityC: Repository<AchievementC>,
    private readonly entityP: Repository<AchievementP>,
  ) {}

  async create(data: Partial<AchievementC>): Promise<AchievementC> {
    const achievementC = await this.entityC.create(data);
    return await this.entityC.save(achievementC);
  }

// 완료타이틀로 상세목록 조회
  // 타이틀 조회
  async findTitleC(id: number): Promise<string | null> {
    const achievementCP = await this.entityC.findOne({
      where: { achievement_id: id },
      relations: ['achievement'], // 🔥 관계 테이블 가져오기
    });
  
    return achievementCP?.achievement?.title ?? null;
  }

  // 서브업적 조회
  async findP(id:number): Promise<AchievementP[] | null> {
    return await this.entityP.find({where:{ achievement_id: id }});
  }

  // 업적만 조회
  async findAll(): Promise<AchievementC[]> {
    return await this.entityC.find({       order: { created_at: 'ASC' },      }); 
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.entityC.delete(id);
  }

}