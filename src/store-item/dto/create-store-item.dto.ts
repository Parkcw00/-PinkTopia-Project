import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '군침이 싹 도는 포션' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'https://example.com/image.png' })
  item_image: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ example: 'true' })
  potion: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: '10' })
  potion_time?: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '100' })
  gem_price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '50' })
  dia_price: number;
}
