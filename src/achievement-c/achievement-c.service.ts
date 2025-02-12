import { Injectable } from '@nestjs/common';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';
import { UpdateAchievementCDto } from './dto/update-achievement-c.dto';

@Injectable()
export class AchievementCService {
  create(createAchievementCDto: CreateAchievementCDto) {
    return 'This action adds a new achievementC';
  }

  findAll() {
    return `This action returns all achievementC`;
  }

  findOne(id: number) {
    return `This action returns a #${id} achievementC`;
  }

  update(id: number, updateAchievementCDto: UpdateAchievementCDto) {
    return `This action updates a #${id} achievementC`;
  }

  remove(id: number) {
    return `This action removes a #${id} achievementC`;
  }
}
