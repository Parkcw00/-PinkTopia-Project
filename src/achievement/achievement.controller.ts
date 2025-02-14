import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';


@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  // 생성
  @Post()
  async create(@Body() createAchievementDto: CreateAchievementDto) {
        return await this.achievementService.create(createAchievementDto);
  }

  // 조회
  @Get()
  async findAll() {
   return  await this.achievementService.findAll();    
  }
/*
  // 활성화 목록 조회
  @Get('active')
  async findAllActive() {
    const activeAchievements = await this.achievementService.findAllActive();
    if (!activeAchievements || activeAchievements.length === 0) {
      throw new NotFoundException('활성화된 업적이 없습니다.');
    }
    return activeAchievements;
  }

  // 카테고리별 조회회
  // 'achievement/?category=OOO'
  @Get('by-category')
  async findByCategory(@Query('category') category?: string) {
    if (!category) {
      throw new BadRequestException('category 값이 없습니다.');
    }
    
    const filteredAchievements = await this.achievementService.findCategory(category);
    if (!filteredAchievements || filteredAchievements.length === 0) {
      throw new NotFoundException(`"${category}" 카테고리에 해당하는 업적이 없습니다.`);
    }

    return filteredAchievements;
  }

  // 상세 조회회
  @Get(':achievementId')
  async findOne(@Param('achievementId') achievementId: string) {
    const id = Number(achievementId);
if (!id) {
  throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
}
    const achievement = await this.achievementService.findOne(id);
    if (!achievement) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 찾을 수 없습니다.`);
    }
    return achievement;
  }

  // 수정
  @Patch(':achievementId')
  async update(
    @Param('achievementId') achievementId: string,      
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {const id = Number(achievementId);
  if (!id) {
    throw new BadRequestException('achievementId 값이 없거나 타이에 맞지 않습니다');
  }
    if (!updateAchievementDto || Object.keys(updateAchievementDto).length === 0) {
      throw new BadRequestException('수정할 데이터를 입력하세요.');
    }

    const updatedAchievement = await this.achievementService.update(id, updateAchievementDto);
    if (!updatedAchievement) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 수정할 수 없습니다.`);
    }

    return updatedAchievement;
  }


  // 삭제
  @Delete(':achievementId')
  async remove(@Param('achievementId') achievementId: string      ) {
    const id = Number(achievementId);
  if (!id) {
    throw new BadRequestException('achievementId 값이 없거나 타이에 맞지 않습니다');
  }
  const deleted = await this.achievementService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`ID ${id}에 해당하는 업적을 삭제할 수 없습니다.`);
    }

    return { message: `ID ${id} 업적이 성공적으로 삭제되었습니다.` };
  }
    */
}
