import { Injectable } from '@nestjs/common';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';

import {AchievementPRepository} from './achievement-p.repository'


@Injectable()
export class AchievementPService {
  constructor(private readonly repository: AchievementPRepository,) {}
  


  create(createAchievementPDto: CreateAchievementPDto) {
    return 'This action adds a new achievementP';
  }

  findAll() {
    return `This action returns all achievementP`;
  }

  findOne(id:string) {
    return `This action returns a #${id} achievementP`;
  }

  update(id: string, updateAchievementPDto: UpdateAchievementPDto) {
    return `This action updates a #${id} achievementP`;
/**
    const id = Number(achievementId);
  if (!id) {
    throw new BadRequestException('achievementId 값이 없거나 타이에 맞지 않습니다');
  }
    if (!updateAchievementPDto || Object.keys(updateAchievementPDto).length === 0) {
      throw new BadRequestException('수정할 데이터를 입력하세요.');
    }

    const updatedAchievementP = this.achievementPService.update(id, updateAchievementPDto);
    if (!updatedAchievementP) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 수정할 수 없습니다.`);
    }
    return updatedAchievementP; */




  }

  remove(id: number) {
    return `This action removes a #${id} achievementP`;
  }
}
