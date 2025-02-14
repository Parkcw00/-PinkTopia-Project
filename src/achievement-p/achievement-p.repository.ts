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
    private readonly repository: Repository<AchievementP>,

    private readonly userEntity: User,
    private readonly entityC: Repository<AchievementC>,
        private readonly entityP: Repository<AchievementP>,



  ) {}

  async findById(id: number): Promise<AchievementP | null> {
    return this.repository.findOne({ where: { id } });
  }

  async updateAchievementP(id: number, data: Partial<AchievementP>): Promise<AchievementP | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
