import { Injectable } from '@nestjs/common';
import { CreateLocationHistoryDto } from './dto/create-location-history.dto';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';

@Injectable()
export class LocationHistoryService {
  create(createLocationHistoryDto: CreateLocationHistoryDto) {
    return 'This action adds a new locationHistory';
  }

  findAll() {
    return `This action returns all locationHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} locationHistory`;
  }

  update(id: number, updateLocationHistoryDto: UpdateLocationHistoryDto) {
    return `This action updates a #${id} locationHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} locationHistory`;
  }
}
