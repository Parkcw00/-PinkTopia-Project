import { Injectable } from '@nestjs/common';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

@Injectable()
export class SubAchievementService {
  create(createSubAchievementDto: CreateSubAchievementDto) {
    return 'This action adds a new subAchievement';
  }

  findAll() {
    return `This action returns all subAchievement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subAchievement`;
  }

  update(id: number, updateSubAchievementDto: UpdateSubAchievementDto) {
    return `This action updates a #${id} subAchievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} subAchievement`;
  }
}
