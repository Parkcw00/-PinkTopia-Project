import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PinkmongService } from './pinkmong.service';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';

@Controller('pinkmong')
export class PinkmongController {
  constructor(private readonly pinkmongService: PinkmongService) {}

  @Post()
  create(@Body() createPinkmongDto: CreatePinkmongDto) {
    return this.pinkmongService.create(createPinkmongDto);
  }

  @Get()
  findAll() {
    return this.pinkmongService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinkmongService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePinkmongDto: UpdatePinkmongDto) {
    return this.pinkmongService.update(+id, updatePinkmongDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinkmongService.remove(+id);
  }
}
