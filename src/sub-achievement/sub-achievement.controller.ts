import {
  Controller,
  Get,  Res,
  Request,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import {AdminGuard} from '../user/guards/admin.guard'
import { SubAchievementService } from './sub-achievement.service';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

@Controller('sub-achievement')
export class SubAchievementController {
  constructor(private readonly service: SubAchievementService) {}

  // 생성
  @Post()
  async create(@Body() createSubAchievementDto: CreateSubAchievementDto) {
    return await await this.service.create(createSubAchievementDto);
  }

  // 유저 전체에 새로고침. 
  // P에 없는 항목은 false로 업데이트 하기
  // 완료되지 않은 서브업적이 있는 업적은 컴플리트에서 삭제하기
  

  // 세부조회
  @Get('/:subAchievementId')
  async findOne(@Param('subAchievementId') subAchievementId: string) {
      return await this.service.findOne(subAchievementId);
  }

  // 전체조회 <- 없애고 업적에서 전체조회+업적별정렬, 업적별 조회 만들기


  // 수정
  @Patch('/:subAchievementId')
  async update(
    @Param('subAchievementId') subAchievementId: string,
    @Body() updateSubAchievementDto: UpdateSubAchievementDto,
  ) {
      return await this.service.update(subAchievementId, updateSubAchievementDto);
  }

  // 삭제
  @Delete('/:subAchievementId')
  async remove(@Param('subAchievementId') subAchievementId: string) {
      return await this.service.softDelete(subAchievementId);
  }
}
