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
} /*

  // 회원가입 시 유저id 와 연결된 7개의 디폴트 데이터 생성
  @UseGuards(UserGuard)
  @Post()
  async createDB(
    @Request() req,
    @Body() createLocationHistoryDto: CreateLocationHistoryDto,
  ) {
    return this.locationHistoryService.createDB(req.user.id);
  }

  // 로그인 시 DB에 있는 유저id 와 연결된 7개의 데이터 발키로 가져오기
  @UseGuards(UserGuard)
  @Post()
  async createValkey(
    @Request() req,
    @Body() createLocationHistoryDto: CreateLocationHistoryDto,
  ) {
    return this.locationHistoryService.createValkey(req.user.id);
  }

  // 10초마다 유저id 와 연결된 7개의 데이터 중에서 수정 기한이 가장 오래된 데이터를 수정
  @UseGuards(UserGuard)
  @Patch(`/Valkey`)
  async updateValkey(
    @Request() req,
    @Body() updateLocationHistoryDto: UpdateLocationHistoryDto,
  ) {
    return this.locationHistoryService.updateValkey(
      req.user.id,
      updateLocationHistoryDto,
    );
  }

  // 10분마다 유저id 와 연결된 7개의 데이터 중에서 수정 기한이 가장 오래된 데이터를 수정
  @UseGuards(UserGuard)
  @Patch(`/DB`)
  async updateDB(
    @Request() req,
    @Body() updateLocationHistoryDto: UpdateLocationHistoryDto,
  ) {
    return this.locationHistoryService.updateDB(
      req.user.id,
      updateLocationHistoryDto,
    );
  }

  // 탈퇴시 유저와 연결된 데이터 모두 삭제
  @UseGuards(UserGuard)
  @Delete()
  async delete(@Request() req) {
    return this.locationHistoryService.delete(+req.user.id);
  }
}
*/
