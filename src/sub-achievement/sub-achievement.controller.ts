import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { SubAchievementService } from './sub-achievement.service';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

@Controller('sub-achievement')
export class SubAchievementController {
  constructor(private readonly subAchievementService: SubAchievementService) {}

  // 생성
  @Post()
  create(@Body() createSubAchievementDto: CreateSubAchievementDto) {
    return this.subAchievementService.create(createSubAchievementDto);
  }

  // 세부조회
  @Get('/:subAchievementId')
  findOne(@Param('subAchievementId') subAchievementId: string) {
    const id = Number(subAchievementId);
    if (!id) {
      throw new BadRequestException('subAchievementId 값이 없거나 타이에 맞지 않습니다');
    }
    return this.subAchievementService.findOne(id);
  }

  // 전체조회
  @Get()
  findAll() {
    return this.subAchievementService.findAll();
  }

  // 수정
  @Patch('/:subAchievementId')
  update(
    @Param('subAchievementId') subAchievementId: string,
    @Body() updateSubAchievementDto: UpdateSubAchievementDto,
  ) {
    const id = Number(subAchievementId);
    if (!id) {
      throw new BadRequestException('subAchievementId 값이 없거나 타이에 맞지 않습니다');
    }
    return this.subAchievementService.update(id, updateSubAchievementDto);
  }

  // 삭제
  @Delete('/:subAchievementId')
  remove(@Param('subAchievementId') subAchievementId: string) {
    const id = Number(subAchievementId);
    if (!id) {
      throw new BadRequestException('subAchievementId 값이 없거나 타이에 맞지 않습니다');
    }
    return this.subAchievementService.remove(id);
  }
}
