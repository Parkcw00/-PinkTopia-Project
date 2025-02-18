import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsInt, MaxLength } from 'class-validator';

export class UpdatePinkmongDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: '새로운 핑크몽A', description: '수정할 핑크몽의 이름', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'https://example.com/new-location', description: '새로운 핑크몽 위치 URL', required: false })
  location_url?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '수정된 설명입니다.', description: '수정할 핑크몽 설명', required: false })
  explain?: string;

  @IsOptional()
  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city']) // ✅ 배열로 직접 ENUM 값 입력
  @ApiProperty({ example: 'desert', enum: ['forest', 'desert', 'ocean', 'mountain', 'city'], description: '수정할 지역 테마', required: false })
  region_theme?: string;

  @IsOptional()
  @IsEnum(['common', 'rare', 'epic', 'legendary']) // ✅ 배열로 직접 ENUM 값 입력
  @ApiProperty({ example: 'legendary', enum: ['common', 'rare', 'epic', 'legendary'], description: '수정할 핑크몽 등급', required: false })
  grade?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ example: 200, description: '수정할 핑크몽 포인트', required: false })
  point?: number;
}
