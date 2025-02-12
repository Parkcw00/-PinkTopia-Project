import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubAchievementService } from './sub-achievement.service';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

@Controller('sub-achievement')
export class SubAchievementController {
  constructor(private readonly subAchievementService: SubAchievementService) {}

  @Post()
  create(@Body() createSubAchievementDto: CreateSubAchievementDto) {
    return this.subAchievementService.create(createSubAchievementDto);
  }

  @Get()
  findAll() {
    return this.subAchievementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subAchievementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubAchievementDto: UpdateSubAchievementDto) {
    return this.subAchievementService.update(+id, updateSubAchievementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subAchievementService.remove(+id);
  }
}
