import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DirectionService } from './direction.service';
import { UserGuard } from 'src/user/guards/user-guard';
import { Socket } from 'socket.io';
import { ConnectedSocket } from '@nestjs/websockets';

@Controller('direction')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  // 북마크 만들기
  @Get('bookmark')
  async getAllSubAchievements() {
    return this.directionService.createBookmarks();
  }
  @UseGuards(UserGuard)
  // 사용자와 거리비교
  @Patch('compare-bookmark')
  async compareBookmark(
    @Request() req,
    @Body()
    compareDirection: {
      user_direction: { latitude: number; longitude: number };
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(compareDirection);
    return this.directionService.compareBookmark(
      req.user.id,
      compareDirection.user_direction.latitude,
      compareDirection.user_direction.longitude,
      client,
    );
  }
}
