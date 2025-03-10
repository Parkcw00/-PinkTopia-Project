import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { PinkmongAppearLocationService } from 'src/pinkmong-appear-location/pinkmong-appear-location.service';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

@Controller('pinkmong-appear-location')
export class PinkmongAppearLocationController {
  constructor(private readonly service: PinkmongAppearLocationService) {}

  // db 읽어서 발키로 다 올리는 로직 추가
  //@UseGuards(UserGuard, AdminGuard)
  @Post('fill-valkey')
  async fillValkey() {
    return await this.service.fillValkey();
  }

  @Post()
  async createLocation(
    @Body() dto: CreatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    return this.service.createLocation(dto);
  }

  @Get()
  async getAllLocations(): Promise<PinkmongAppearLocation[]> {
    return this.service.getAllLocations();
  }

  @Get('getOne')
  async getOne(
    @Body('user_id') user_email: string,
  ): Promise<{ id: number } | undefined> {
    return this.service.findOne(user_email);
  }

  @Patch(':id')
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    return this.service.updateLocation(id, updateDto);
  }

  @Delete(':id')
  async deleteLocation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.deleteLocation(id);
  }
}
