import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreatePinkmongAppearLocationDto {
  @IsString()
  title: string;

  @ApiProperty({ description: '위도', minimum: -90, maximum: 90 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: '경도', minimum: -180, maximum: 180 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme: string;
}
