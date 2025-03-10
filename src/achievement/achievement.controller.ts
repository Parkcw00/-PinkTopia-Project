import {
  Controller,
  Get,
  Res,
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
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { AchievementService } from './achievement.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  // 생성
  @UseGuards(UserGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @Body() createAchievementDto: CreateAchievementDto,
    @UploadedFiles() files: Express.Multer.File[], // 단일 파일로 변경
  ) {
    console.log(createAchievementDto);
    console.log(typeof createAchievementDto.title);
    console.log(`파일즈`, files);
    return await this.achievementService.create(createAchievementDto, files);
  }

  // 조회
  @UseGuards(UserGuard)
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return await this.achievementService.findAll();
  }
  // + 완료 목록 조회
  @UseGuards(UserGuard)
  @Get('/done')
  async findAllDone(@Request() req) {
    const userId = req.user.id;
    return await this.achievementService.findAllDone(userId);
  }
  // 활성화 목록 조회
  @Get('/active')
  async findAllActive() {
    return await this.achievementService.findAllActive();
  }
  // 카테고리별 조회
  // 'achievement/?category=OOO'
  @Get('by-category')
  async findByCategory(@Query('category') category?: string) {
    // category ?? '' → undefined일 경우 빈 문자열을 기본값으로 설정.
    return await this.achievementService.findCategory(category ?? '');
  }

  // 상세 조회 /:id와 /done를 구별 못함
  @Get('/achievementId/:achievementId')
  async findOne(@Param('achievementId') achievementId: string) {
    console.log('상세조회', achievementId);
    return await this.achievementService.findOne(achievementId);
  }

  // 상세 조회 (완료 상태 포함)
  @UseGuards(UserGuard)
  @Get('/achievementId/:achievementId/withStatus')
  async findOneWithStatus(
    @Param('achievementId') achievementId: string,
    @Request() req
  ) {
    const userId = req.user.id;
    console.log('상세조회 (완료 상태 포함)', achievementId, '사용자:', userId);
    return await this.achievementService.getAchievementWithSubAchievements(achievementId, userId);
  }

  // 수정
  @UseGuards(UserGuard, AdminGuard)
  @Patch(':achievementId')
  async update(
    @Param('achievementId') achievementId: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.achievementService.update(
      achievementId,
      updateAchievementDto,
      files,
    );
  }

  // 삭제
  @UseGuards(UserGuard, AdminGuard)
  @Delete(':achievementId')
  async remove(@Param('achievementId') achievementId: string) {
    return await this.achievementService.remove(achievementId);
  }
}
