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
  @Get('bookmark')
  async getAllSubAchievements() {
    console.log('🚀 GET /direction/bookmark 요청 받음');

    try {
      const result = await this.directionService.createBookmarks();
      console.log('✅ 북마크 데이터:', result);
      return result;
    } catch (error) {
      console.error('❌ 북마크 가져오기 실패:', error.message);
      throw error;
    }
  }
  /*
  @Get()
  findAll() {
    return this.directionService.findAll();
  }*/

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.directionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDirectionDto: UpdateDirectionDto,
  ) {
    return this.directionService.update(+id, updateDirectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.directionService.remove(+id);
  }
}
