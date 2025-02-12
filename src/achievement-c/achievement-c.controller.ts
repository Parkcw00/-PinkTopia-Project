import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AchievementCService } from './achievement-c.service';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';
import { UpdateAchievementCDto } from './dto/update-achievement-c.dto';

@Controller('achievement-c')
export class AchievementCController {
  constructor(private readonly achievementCService: AchievementCService) {}

  @Post()
  create(@Body() createAchievementCDto: CreateAchievementCDto) {
    return this.achievementCService.create(createAchievementCDto);
  }

  @Get()
  findAll() {
    return this.achievementCService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementCService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAchievementCDto: UpdateAchievementCDto) {
    return this.achievementCService.update(+id, updateAchievementCDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementCService.remove(+id);
  }
}
