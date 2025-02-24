import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationHistoryService } from './location-history.service';
import { CreateLocationHistoryDto } from './dto/create-location-history.dto';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';
import { UserGuard } from '../user/guards/user-guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('location-history')
export class LocationHistoryController {
  constructor(
    private readonly locationHistoryService: LocationHistoryService,
  ) {}

  /**
   * ✅ 회원가입 시 기본 7개의 위치 데이터를 생성합니다.
   * 엔드포인트: **POST /location-history/default**
   */
  @Post('default')
  async createDB(@Body('user_id', ParseIntPipe) user_id: number) {
    const locationHistory = await this.locationHistoryService.createDB(user_id);
    return { message: '기본 위치 데이터 생성 완료', locationHistory };
  }
  /**
   * ✅ 로그인 시, DB의 위치 데이터를 valkey(캐싱)에 저장합니다.
   * 엔드포인트: **POST /location-history/valkey**
   */
  @UseGuards(UserGuard)
  @Post('valkey')
  async createValkey(@Request() req) {
    const updatedValkey = await this.locationHistoryService.createValkey(
      req.user.id,
    );
    return { message: 'valkey 저장 완료', data: updatedValkey };
  }

  /**
   * ✅ 10초마다 실행되어, 최신 위치 데이터를 valkey에 업데이트합니다.
   * 엔드포인트: **PATCH /location-history/valkey**
   */
  @UseGuards(UserGuard)
  @Patch('valkey')
  async updateValkey(
    @Request() req,
    @Body() updateDto: UpdateLocationHistoryDto,
  ) {
    await this.locationHistoryService.updateValkey(req.user.id, updateDto);
    return { message: 'valkey 업데이트 완료' };
  }

  /**
   * ✅ 10분마다 실행되어, 최신 위치 데이터를 DB에 업데이트합니다.
   * 엔드포인트: **PATCH /location-history/db**
   */
  @UseGuards(UserGuard)
  @Patch('db')
  async updateDB(@Request() req, @Body() updateDto: UpdateLocationHistoryDto) {
    return await this.locationHistoryService.updateDB(req.user.id, updateDto);
  }
}
