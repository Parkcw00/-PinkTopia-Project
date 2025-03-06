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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { SubAchievementService } from './sub-achievement.service';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('sub-achievement')
export class SubAchievementController {
  constructor(private readonly service: SubAchievementService) {}

  // db 읽어서 발키로 다 올리는 로직 추가
  //@UseGuards(UserGuard, AdminGuard)
  @Post('fill-valkey')
  async fillValkey() {
    return await await this.service.fillGeo();
  }

  // 생성
  @UseGuards(UserGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @Body() createSubAchievementDto: CreateSubAchievementDto,
    @UploadedFiles() files: Express.Multer.File[], // 단일 파일로 변경
  ) {
    console.log(createSubAchievementDto);
    return await await this.service.create(createSubAchievementDto, files);
  }

  // 유저 전체에 새로고침.
  // 유저 전체에 새로고침.
  // P에 없는 항목은 false로 업데이트 하기
  // 완료되지 않은 서브업적이 있는 업적은 컴플리트에서 삭제하기

  // 세부조회 <- 지도에 위치, 정보 보이게 추가하기
  @Get('/:subAchievementId')
  async findOne(@Param('subAchievementId') subAchievementId: string) {
    return await this.service.findOne(subAchievementId);
    return await this.service.findOne(subAchievementId);
  }

  // 전체조회 <- 없애고 업적에서 전체조회+업적별정렬, 업적별 조회 만들기
  // 핑크몽 출현위치는 필요할듯

  // 수정
  @UseGuards(UserGuard, AdminGuard)
  @UseGuards(UserGuard, AdminGuard)
  @Patch('/:subAchievementId')
  async update(
    @Param('subAchievementId') subAchievementId: string,
    @Body() updateSubAchievementDto: UpdateSubAchievementDto,
  ) {
    return await this.service.update(subAchievementId, updateSubAchievementDto);
    return await this.service.update(subAchievementId, updateSubAchievementDto);
  }

  // 삭제
  @UseGuards(UserGuard, AdminGuard)
  @UseGuards(UserGuard, AdminGuard)
  @Delete('/:subAchievementId')
  async remove(@Param('subAchievementId') subAchievementId: string) {
    return await this.service.softDelete(subAchievementId);
    return await this.service.softDelete(subAchievementId);
  }
}
