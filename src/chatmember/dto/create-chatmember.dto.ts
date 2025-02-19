import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatmemberDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  chatting_room_id: number;

  @IsBoolean()
  admin: boolean = false;
}
