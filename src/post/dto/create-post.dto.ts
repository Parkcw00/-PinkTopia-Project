import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '게시글 제목' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '게시글 내용' })
  content: string;
}
