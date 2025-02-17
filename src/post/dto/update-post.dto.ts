import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: '게시글 제목' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '게시글 내용' })
  content: string;
}
