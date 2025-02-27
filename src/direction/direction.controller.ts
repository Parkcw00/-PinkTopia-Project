import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DirectionService } from './direction.service';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Controller('direction')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  // 북마크 만들기
  @Get('bookmarke')
  async getAllSubAchievements() {
    return this.directionService.createBookmarks();
  }
}
