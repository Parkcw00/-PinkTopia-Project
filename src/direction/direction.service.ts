import { Injectable } from '@nestjs/common';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Injectable()
export class DirectionService {
  create(createDirectionDto: CreateDirectionDto) {
    return 'This action adds a new direction';
  }

  findAll() {
    return `This action returns all direction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} direction`;
  }

  update(id: number, updateDirectionDto: UpdateDirectionDto) {
    return `This action updates a #${id} direction`;
  }

  remove(id: number) {
    return `This action removes a #${id} direction`;
  }
}
