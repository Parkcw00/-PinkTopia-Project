import { IsString, IsOptional, IsEnum, IsInt, MaxLength } from 'class-validator';

export class UpdatePinkmongDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_url?: string;

  @IsOptional()
  @IsString()
  explain?: string;

  @IsOptional()
  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme?: string;

  @IsOptional()
  @IsEnum(['common', 'rare', 'epic', 'legendary'])
  grade?: string;

  @IsOptional()
  @IsInt()
  point?: number;
}
