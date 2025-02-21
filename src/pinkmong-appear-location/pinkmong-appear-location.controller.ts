import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { CreatePinkmongAppearLocationDto } from './dto/create-pinkmong-appear-location.dto';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

@Controller('pinkmong-appear-location')
export class PinkmongAppearLocationController {
  constructor(private readonly pinkmongAppearLocationService: PinkmongAppearLocationService) {}

  @Post()
  create(@Body() createPinkmongAppearLocationDto: CreatePinkmongAppearLocationDto) {
    return this.pinkmongAppearLocationService.create(createPinkmongAppearLocationDto);
  }

  @Get()
  findAll() {
    return this.pinkmongAppearLocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pinkmongAppearLocationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePinkmongAppearLocationDto: UpdatePinkmongAppearLocationDto) {
    return this.pinkmongAppearLocationService.update(+id, updatePinkmongAppearLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pinkmongAppearLocationService.remove(+id);
  }
}
