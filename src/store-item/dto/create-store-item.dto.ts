import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateStoreItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '군침이 싹 도는 포션' })
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ example: 'true' })
  potion?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ example: '10' })
  potion_time?: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ example: '100' })
  gem_price: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @ApiProperty({ example: '50' })
  dia_price: number;
}
