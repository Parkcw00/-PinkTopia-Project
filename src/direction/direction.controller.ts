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
import { DirectionService } from './direction.service';
import { CompareDirection } from './dto/compare-direction.dto';

@Controller('direction')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  // 북마크 만들기
  @Get('bookmarke')
  async getAllSubAchievements() {
    return this.directionService.createBookmarks();
  }

  // 사용자와 거리비교
  @Patch('compare-bookmark')
  async compareBookmark(
    @Request() req,
    @Body('CompareDirection') compareDirection: CompareDirection,
  ) {
    return this.directionService.compareBookmark(req.user.id, compareDirection);
  }
  //user_direction, bookmark_direction[]

  // 지도에 북마커 표시
}
