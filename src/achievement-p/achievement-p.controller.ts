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

  // 하나씩 추가
  @Post()
  async create(@Body() createAchievementPDto: CreateAchievementPDto) {
    return this.achievementPService.create(createAchievementPDto);
  }

// 전체조회
  @Get()
  async findAll() {
    return this.achievementPService.findAll();
  }

  // Achievement타이틀 별 조회


// 개별조회
 @Get(':achievementPId')
  async findOne(@Param('achievementPId') achievementPId: string) {
  
    return this.achievementPService.findOne(achievementPId);
  }

  

  // Achievement 타이틀과 일치하는 목록 추가

  // 수행으로 수정
  @Patch(':id')
  async update(@Param('achievementId') achievementId: string,
      @Body() updateAchievementPDto: UpdateAchievementPDto,
  ) {
    return this.achievementPService.update(achievementId,updateAchievementPDto)
    
  }




  @Delete(':id')
  async remove(@Param('achievementId') achievementId: string) {const id = Number(achievementId);
    if (!id) {
      throw new BadRequestException('achievementId 값이 없거나 타이에 맞지 않습니다');
    }
    return this.achievementPService.remove(+id);
  }
}
