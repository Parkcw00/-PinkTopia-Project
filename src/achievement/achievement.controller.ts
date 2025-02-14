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

  // 활성화 목록 조회
  @Get('active')
  async findAllActive() {    
    return await this.achievementService.findAllActive();
  }

  // 카테고리별 조회회
  // 'achievement/?category=OOO'
  @Get('by-category')
  async findByCategory(@Query('category') category?: string) {
    // category ?? '' → undefined일 경우 빈 문자열을 기본값으로 설정.
    return await this.achievementService.findCategory(category ?? '');
  }
  
  // 상세 조회
  @Get(':achievementId')
  async findOne(@Param('achievementId') achievementId: string) {
    return await this.achievementService.findOne(achievementId);
  }

  // 수정
  @Patch(':achievementId')
  async update(
    @Param('achievementId') achievementId: string,      
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {  
    return await this.achievementService.update(achievementId, updateAchievementDto);
    }


  // 삭제
  @Delete(':achievementId')
  async remove(@Param('achievementId') achievementId: string      ) {
    return await this.achievementService.remove(achievementId);
  }

}
