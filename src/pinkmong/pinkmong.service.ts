import { Injectable } from '@nestjs/common';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';

@Injectable()
export class PinkmongService {
  create(createPinkmongDto: CreatePinkmongDto) {
    return 'This action adds a new pinkmong';
  }

  findAll() {
    return `This action returns all pinkmong`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinkmong`;
  }

  update(id: number, updatePinkmongDto: UpdatePinkmongDto) {
    return `This action updates a #${id} pinkmong`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinkmong`;
  }
}
