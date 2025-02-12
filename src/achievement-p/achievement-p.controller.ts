import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AchievementPService } from './achievement-p.service';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';

@Controller('achievement-p')
export class AchievementPController {
  constructor(private readonly achievementPService: AchievementPService) {}

  @Post()
  create(@Body() createAchievementPDto: CreateAchievementPDto) {
    return this.achievementPService.create(createAchievementPDto);
  }

  @Get()
  findAll() {
    return this.achievementPService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementPService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAchievementPDto: UpdateAchievementPDto) {
    return this.achievementPService.update(+id, updateAchievementPDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementPService.remove(+id);
  }
}
