import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChattingroomService } from './chattingroom.service';
import { CreateChattingroomDto } from './dto/create-chattingroom.dto';
import { UpdateChattingroomDto } from './dto/update-chattingroom.dto';

@Controller('chattingroom')
export class ChattingroomController {
  constructor(private readonly chattingroomService: ChattingroomService) {}

  @Post()
  create(@Body() createChattingroomDto: CreateChattingroomDto) {
    return this.chattingroomService.create(createChattingroomDto);
  }

  @Get()
  findAll() {
    return this.chattingroomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chattingroomService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChattingroomDto: UpdateChattingroomDto,
  ) {
    return this.chattingroomService.update(+id, updateChattingroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chattingroomService.remove(+id);
  }
}
