import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatblacklistDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  chatting_room_id: number;
}
