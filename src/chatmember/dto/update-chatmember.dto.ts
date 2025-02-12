import { PartialType } from '@nestjs/mapped-types';
import { CreateChatmemberDto } from './create-chatmember.dto';

export class UpdateChatmemberDto extends PartialType(CreateChatmemberDto) {}
