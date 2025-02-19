import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationHistoryService } from './location-history.service';
import { CreateLocationHistoryDto } from './dto/create-location-history.dto';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';

@Controller('location-history')
export class LocationHistoryController {
  constructor(
    private readonly locationHistoryService: LocationHistoryService,
  ) {}

  @Post()
  create(@Body() createLocationHistoryDto: CreateLocationHistoryDto) {
    return this.locationHistoryService.create(createLocationHistoryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationHistoryDto: UpdateLocationHistoryDto,
  ) {
    return this.locationHistoryService.update(+id, updateLocationHistoryDto);
  }
}
