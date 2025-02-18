import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementP } from './entities/achievement-p.entity';

import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { User } from '../user/entities/user.entity';
import { Achievement } from '../achievement/entities/achievement.entity';

@Injectable()
export class AchievementPRepository {
  constructor(
    @InjectRepository(Achievement)
    private readonly entityA: Repository<Achievement>,

    @InjectRepository(AchievementP)
    private readonly entityP: Repository<AchievementP>,

    @InjectRepository(AchievementC)
    private readonly entityC: Repository<AchievementC>,
    @InjectRepository(SubAchievement)
    private readonly entityS: Repository<SubAchievement>,
    @InjectRepository(User)
    private readonly entityU: Repository<User>,
  ) {}

  // 하나만 조회 - S
  async findSub(id: number): Promise<SubAchievement | null> {
    return await this.entityS.findOne({ where: { id } });
  }

  // 하나만 조회 - P
  async findOne(id: number): Promise<AchievementP | null> {
    return await this.entityP.findOne({ where: { id } });
  }

  // 이미 존재하는지 확인
  async findPByUserNSub(
    user_id: number,
    idS: number,
  ): Promise<AchievementP | null> {
    return await this.entityP.findOne({
      where: { user_id, sub_achievement_id: idS },
    });
  }

  // create()는 데이터베이스에 저장하지 않고 엔터티 인스턴스만 생성
  async createP(data: Partial<AchievementP>): Promise<AchievementP> {
    return this.entityP.create(data);
  }

  // 반드시 save()를 호출해야 데이터베이스에 저장됨.
  async save(data: AchievementP): Promise<AchievementP> {
    return this.entityP.save(data);
  }

  // sub
  async subAllByA(achievement_id: number): Promise<SubAchievement[]> {
    return await this.entityS.find({ where: { achievement_id } });
  }

  // P
  async pAllByA(achievement_id: number): Promise<AchievementP[]> {
    return await this.entityP.find({ where: { achievement_id } });
  }

  async updateP(id: number): Promise<void> {
    await this.entityP.update(id, { complete: true });
  }

  async delete(id: number): Promise<void> {
    await this.entityP.delete(id); // 삭제 실행
  }

  // C에 추가

  // 생성
  async createC(data: Partial<AchievementC>): Promise<AchievementC> {
    const achievementC = await this.entityC.create(data);
    return await this.entityC.save(achievementC);
  }
  // 반드시 save()를 호출해야 데이터베이스에 저장됨.
  async saveC(achievement: AchievementC): Promise<AchievementC> {
    return await this.entityC.save(achievement);
  }
  // 유저에게 보상 지급
  //async giveReward()
  // 보상 조회
  async reward(achievementId: number): Promise<{ reward: any }> {
    const achievement = await this.entityA.findOne({
      where: { id: achievementId },
      select: ['reward'],
    });

    return achievement ? { reward: achievement.reward } : { reward: null };
  }

  // 보상 수여 update entityU
  // 💎 Pink Gem 업데이트
  async gem(user_id: number, gem: number) {
    return await this.entityU
      .createQueryBuilder()
      .update()
      .set({ pink_gem: () => `pink_gem + ${gem}` }) // 현재 값에 gem 추가
      .where('id = :user_id', { user_id })
      .execute();
  }

  // 💎 Pink Diamond 업데이트
  async dia(user_id: number, dia: number) {
    return await this.entityU
      .createQueryBuilder()
      .update()
      .set({ pink_dia: () => `pink_dia + ${dia}` }) // 현재 값에 dia 추가
      .where('id = :user_id', { user_id })
      .execute();
  }
}
