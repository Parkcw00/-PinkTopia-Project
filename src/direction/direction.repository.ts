import { Injectable } from '@nestjs/common';
import { IsNull, Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'; /*
import { SubAchievement } from './entities/sub-achievement.entity';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';
import { promises } from 'dns';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';
*/
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';

@Injectable()
export class DirectionRepository {
  constructor() // @InjectRepository(AchievementC) // private readonly entity: Repository<SubAchievement>, // @InjectRepository(SubAchievement)
  // private readonly entityC: Repository<AchievementC>,
  {}
}
