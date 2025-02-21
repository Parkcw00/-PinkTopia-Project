import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { PinkmongAppearLocationService } from 'src/pinkmong-appear-location/pinkmong-appear-location.service';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

@Controller('pinkmong-appear-location')
export class PinkmongAppearLocationController {
  constructor(private readonly service: PinkmongAppearLocationService) {}

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

  @Get(':id')
  async getLocationById(
    @Param('id') id: number,
  ): Promise<PinkmongAppearLocation> {
    return this.service.getLocationById(id);
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: number): Promise<void> {
    return this.service.deleteLocation(id);
  }
}
