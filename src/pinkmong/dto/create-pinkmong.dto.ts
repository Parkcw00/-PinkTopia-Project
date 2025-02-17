import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsInt, MaxLength, IsNotEmpty } from 'class-validator';

export class CreatePinkmongDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: '핑크몽A', description: '핑크몽의 이름' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'https://example.com/location', description: '핑크몽의 위치 URL', required: false })
  location_url?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '이 핑크몽은 숲에서 발견됩니다.', description: '핑크몽 설명' })
  explain: string;

  @IsNotEmpty()
  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city']) // ✅ 배열로 직접 ENUM 값 입력
  @ApiProperty({ example: 'forest', enum: ['forest', 'desert', 'ocean', 'mountain', 'city'], description: '지역 테마' })
  region_theme: string;

  @IsNotEmpty()
  @IsEnum(['common', 'rare', 'epic', 'legendary']) // ✅ 배열로 직접 ENUM 값 입력
  @ApiProperty({ example: 'epic', enum: ['common', 'rare', 'epic', 'legendary'], description: '핑크몽 등급' })
  grade: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ example: 100, description: '핑크몽 포인트' })
  point: number;
}
