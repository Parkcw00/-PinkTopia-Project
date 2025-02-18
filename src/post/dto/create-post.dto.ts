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

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: '업로드할 파일들',
  })
  files?: Express.Multer.File[];
}
