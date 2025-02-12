import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CreateCatchPinkmongDto } from './dto/create-catch_pinkmong.dto';
import { UpdateCatchPinkmongDto } from './dto/update-catch_pinkmong.dto';

@Controller('catch-pinkmong')
export class CatchPinkmongController {
  constructor(private readonly catchPinkmongService: CatchPinkmongService) {}

  @Post()
  create(@Body() createCatchPinkmongDto: CreateCatchPinkmongDto) {
    return this.catchPinkmongService.create(createCatchPinkmongDto);
  }

  @Get()
  findAll() {
    return this.catchPinkmongService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catchPinkmongService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatchPinkmongDto: UpdateCatchPinkmongDto) {
    return this.catchPinkmongService.update(+id, updateCatchPinkmongDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catchPinkmongService.remove(+id);
  }
}
