import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';

import {AchievementPRepository} from './achievement-p.repository'


@Injectable()
export class AchievementPService {
  constructor(private readonly repository: AchievementPRepository,) {}
  


  async update(id: string) : Promise<{message:string}>{
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
    }
    const isExists = await this.repository.findOne(idA)
    if(!isExists){
      throw new NotFoundException(`ID ${id}에 해당하는 업적이 존재하지 않습니다.`);
    }
    if(isExists.complete){
      throw new NotFoundException(`이미 달성한 업적입니다.`);
    }
    await this.repository.updateP(idA)

     // 업데이트 후 다시 조회하여 확인
  const isUpdated = await this.repository.findOne(idA);
  if (!isUpdated?.complete) {
    throw new NotFoundException(`업데이트 실패`);
  }
    return {message : '서브업적 달성!'}
  }
}
