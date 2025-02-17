import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,ParseIntPipe,BadRequestException,NotFoundException
} from '@nestjs/common';
import { AchievementPService } from './achievement-p.service';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';

@Controller('achievement-p')
export class AchievementPController {
  constructor(private readonly achievementPService: AchievementPService) {}


  //  유저 회원가입 시 생성(쭈루룩 추가)

  // 수행으로 수정
  @Patch(':achievementPId')
  async update(@Param('achievementPId') achievementPId: string,
  ) {
    return this.achievementPService.update(achievementPId)
  }

}
