import {  
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,NotFoundException
} from '@nestjs/common';
import { AchievementCService } from './achievement-c.service';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';
import { UpdateAchievementCDto } from './dto/update-achievement-c.dto';


@Controller('achievementC')
export class AchievementCController {
  constructor(private readonly achievementCService: AchievementCService) {}

// 완료 업적 추가
  @Post()
  async create(@Body() createAchievementCDto: CreateAchievementCDto) {
    return await this.achievementCService.create(createAchievementCDto);
  }

// 완료 업적 상세 조회
  @Get(':achievementCId')
  async findOne(@Param('achievementCId') achievementCId: string) {
    return await this.achievementCService.findOne(achievementCId);
  }

// 완료 업적 모두 조회
@Get()
async find(){
  return await this.achievementCService.findAll()
}

  // 삭제(업적 자체가 업적테이블에서 지워질 때... 쓸일 없나?)
  @Delete(':achievementCId')
  async remove(@Param('achievementCId') achievementCId: string) {
    return await this.achievementCService.remove(achievementCId);    
  }

}
