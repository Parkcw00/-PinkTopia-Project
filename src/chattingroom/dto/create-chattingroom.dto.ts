import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChattingRoomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

}

