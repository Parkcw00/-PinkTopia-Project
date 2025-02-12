import { PartialType } from '@nestjs/mapped-types';
import { CreateChatblacklistDto } from './create-chatblacklist.dto';

export class UpdateChatblacklistDto extends PartialType(CreateChatblacklistDto) {}
