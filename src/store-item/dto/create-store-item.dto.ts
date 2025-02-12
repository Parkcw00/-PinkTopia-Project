import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  item_image: string;

  @IsNotEmpty()
  @IsBoolean()
  potion: boolean;

  @IsOptional()
  @IsNumber()
  potion_time?: number;

  @IsNotEmpty()
  @IsNumber()
  gem_price: number;

  @IsNotEmpty()
  @IsNumber()
  dia_price: number;
}
