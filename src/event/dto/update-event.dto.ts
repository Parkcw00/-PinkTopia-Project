import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: '새로운 이벤트 제목',
    description: '수정할 이벤트 제목',
    required: false,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '업데이트된 이벤트 내용입니다.',
    description: '수정할 이벤트 내용',
    required: false,
  })
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'https://example.com/new-event-image.jpg',
    description: '수정할 이벤트 이미지 URL',
    required: false,
  })
  image?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'https://example.com/new-event-image.jpg',
    description: 'S3에 업로드된 파일 URL',
    required: false,
  })
  fileUrl?: string; // ✅ fileUrl 추가

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-05-01',
    description: '수정할 이벤트 만료 날짜 (YYYY-MM-DD)',
    required: false,
  })
  expiration_at?: string;

  @IsOptional()
  @IsEnum(['active', 'closed'])
  @ApiProperty({
    example: 'closed',
    enum: ['active', 'closed'],
    description: '이벤트 상태 변경',
    required: false,
  })
  status?: string;
}
