import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: '이벤트 제목', description: '이벤트의 제목' })
  title: string;

  @IsString()
  @ApiProperty({ example: '이벤트 내용입니다.', description: '이벤트의 내용' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'https://example.com/event-image.jpg', description: '이벤트 이미지 URL', required: false })
  image?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2025-03-13', description: '이벤트 만료 날짜 (YYYY-MM-DD)', required: false })
  expiration_at?: string;

  @IsOptional()
  @IsEnum(['active', 'closed'])
  @ApiProperty({ example: 'active', enum: ['active', 'closed'], description: '이벤트 상태', required: false })
  status?: string;
}
