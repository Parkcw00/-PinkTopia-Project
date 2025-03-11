import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationHistoryDto } from './create-location-history.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDate, Min, Max } from 'class-validator';

export class UpdateLocationHistoryDto extends PartialType(
  CreateLocationHistoryDto,
) {
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

  @ApiProperty({ description: '타임스탬프' })
  @IsOptional()
  @IsDate()
  timestamp?: Date;
}
