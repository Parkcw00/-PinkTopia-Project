import { Injectable } from '@nestjs/common';
import { CreatePinkmongAppearLocationDto } from './dto/create-pinkmong-appear-location.dto';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

@Injectable()
export class PinkmongAppearLocationService {
  create(createPinkmongAppearLocationDto: CreatePinkmongAppearLocationDto) {
    return 'This action adds a new pinkmongAppearLocation';
  }

  findAll() {
    return `This action returns all pinkmongAppearLocation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinkmongAppearLocation`;
  }

  update(id: number, updatePinkmongAppearLocationDto: UpdatePinkmongAppearLocationDto) {
    return `This action updates a #${id} pinkmongAppearLocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinkmongAppearLocation`;
  }
}
