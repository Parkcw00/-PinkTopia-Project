import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChattingRoomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  password?: string;
}

