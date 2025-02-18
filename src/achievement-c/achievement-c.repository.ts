import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {AchievementC} from './entities/achievement-c.entity';
import {AchievementP} from '../achievement-p/entities/achievement-p.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AchievementCRepository {
  constructor(
    @InjectRepository(AchievementC)
    private readonly entityC: Repository<AchievementC>,
    @InjectRepository(AchievementP)
    private readonly entityP: Repository<AchievementP>,
    @InjectRepository(User)
    private readonly entityU: Repository<User>,
  ) {}

  // 존재여부확인. 유저id, 업적id
  async isExists(user_id:number, achievement_id:number): Promise<AchievementC | null>{
    return await this.entityC.findOne({ where: { user_id, achievement_id} });
  }

  /*
  // 관리자권한확인
  async isManager(user_id:number): Promise<boolean>{
    const user = await this.entityU.findOne({
      where: { id: user_id },
      select: ['role'],
    });
  
    return user?.role === 1; // role이 true이면 관리자, 아니면 false 반환
  }
  */


  // 생성
  async create(data: Partial<AchievementC>): Promise<AchievementC> {
    const achievementC = await this.entityC.create(data);
    return await this.entityC.save(achievementC);
  }
    // 반드시 save()를 호출해야 데이터베이스에 저장됨.
  async save(achievement: AchievementC): Promise<AchievementC> {
    return await this.entityC.save(achievement);
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