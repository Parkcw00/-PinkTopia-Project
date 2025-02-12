import { Injectable } from '@nestjs/common';
import { CreateCatchPinkmongDto } from './dto/create-catch_pinkmong.dto';
import { UpdateCatchPinkmongDto } from './dto/update-catch_pinkmong.dto';

@Injectable()
export class CatchPinkmongService {
  create(createCatchPinkmongDto: CreateCatchPinkmongDto) {
    return 'This action adds a new catchPinkmong';
  }

  findAll() {
    return `This action returns all catchPinkmong`;
  }

  findOne(id: number) {
    return `This action returns a #${id} catchPinkmong`;
  }

  update(id: number, updateCatchPinkmongDto: UpdateCatchPinkmongDto) {
    return `This action updates a #${id} catchPinkmong`;
  }

  remove(id: number) {
    return `This action removes a #${id} catchPinkmong`;
  }
}
