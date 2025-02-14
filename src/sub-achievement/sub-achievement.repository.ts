import { EntityRepository, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SubAchievement } from './entities/sub-achievement.entity'

@Injectable()
@EntityRepository(SubAchievement)
export class SubAchievementRepository extends Repository<SubAchievement> {
  createSubAchievement(subAchievement: SubAchievement) {
    throw new Error('Method not implemented.');
  }
  findAll() {
    throw new Error('Method not implemented.');
  }
  // 커스텀 쿼리 메서드 추가 가능
}
