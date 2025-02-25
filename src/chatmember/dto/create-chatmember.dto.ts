import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateChatmemberDto {
  @ApiProperty({ description: '채팅방 아이디' })
  @IsNumber()
  @IsNotEmpty()
  chatting_room_id: number;

  @IsBoolean()
  admin: boolean = false;
}
