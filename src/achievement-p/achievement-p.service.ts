import { Injectable } from '@nestjs/common';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';

@Injectable()
export class AchievementPService {
  create(createAchievementPDto: CreateAchievementPDto) {
    return 'This action adds a new achievementP';
  }

  findAll() {
    return `This action returns all achievementP`;
  }

  findOne(id: number) {
    return `This action returns a #${id} achievementP`;
  }

  update(id: number, updateAchievementPDto: UpdateAchievementPDto) {
    return `This action updates a #${id} achievementP`;
  }

  remove(id: number) {
    return `This action removes a #${id} achievementP`;
  }
}
