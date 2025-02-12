import { Injectable } from '@nestjs/common';
import { CreateChatmemberDto } from './dto/create-chatmember.dto';
import { UpdateChatmemberDto } from './dto/update-chatmember.dto';

@Injectable()
export class ChatmemberService {
  create(createChatmemberDto: CreateChatmemberDto) {
    return 'This action adds a new chatmember';
  }

  findAll() {
    return `This action returns all chatmember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatmember`;
  }

  update(id: number, updateChatmemberDto: UpdateChatmemberDto) {
    return `This action updates a #${id} chatmember`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatmember`;
  }
}
