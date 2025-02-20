import { PartialType } from '@nestjs/mapped-types';
import { CreateChatmemberDto } from './create-chatmember.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateChatmemberDto extends PartialType(CreateChatmemberDto) {
  @IsBoolean()
  admin: boolean;
}
