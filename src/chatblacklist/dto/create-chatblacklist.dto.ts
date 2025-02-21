import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateChatblacklistDto {
  @ApiProperty({ description: '유저 아이디' })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: '채팅방 아이디' })
  @IsNumber()
  @IsNotEmpty()
  chatting_room_id: number;
}
