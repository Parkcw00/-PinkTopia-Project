import { Injectable } from '@nestjs/common';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Injectable()
export class DirectionService {
  create(createDirectionDto: CreateDirectionDto) {
    return 'This action adds a new direction';
  }
  /*
  async findAll() {
    const keys = await this.redisClient.keys('bookmark:*');
    const bookmarks = [];
   
    for (const key of keys) {
      const data = await this.redisClient.hgetall(key);
      bookmarks.push({
        id: key.replace('bookmark:', ''),
        title: data.title,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      });
    }

    return bookmarks;
  }

  findOne(id: number) {
    return `This action returns a #${id} direction`;
  }

  update(id: number, updateDirectionDto: UpdateDirectionDto) {
    return `This action updates a #${id} direction`;
  }

  remove(id: number) {
    return `This action removes a #${id} direction`;
  }*/
}
