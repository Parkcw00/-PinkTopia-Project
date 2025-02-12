import { Injectable } from '@nestjs/common';
import { CreateChattingroomDto } from './dto/create-chattingroom.dto';
import { UpdateChattingroomDto } from './dto/update-chattingroom.dto';

@Injectable()
export class ChattingroomService {
  create(createChattingroomDto: CreateChattingroomDto) {
    return 'This action adds a new chattingroom';
  }

  findAll() {
    return `This action returns all chattingroom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chattingroom`;
  }

  update(id: number, updateChattingroomDto: UpdateChattingroomDto) {
    return `This action updates a #${id} chattingroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chattingroom`;
  }
}
