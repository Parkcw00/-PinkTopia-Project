import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {AchievementP} from './entities/achievement-p.entity';

import {AchievementC} from '../achievement-c/entities/achievement-c.entity';
import {User} from '../user/entities/user.entity';


@Injectable()
export class AchievementPRepository {
  constructor(
    @InjectRepository(AchievementP)
    private readonly entity: Repository<AchievementP>
  ) {}

  
    // 하나만 조회
    async findOne(id: number): Promise<AchievementP | null>{
      return await this.entity.findOne({ where: { id } });
    }
    

  async updateP(id: number): Promise<void> {
    await this.entity.update(id, {complete:true});
}
}