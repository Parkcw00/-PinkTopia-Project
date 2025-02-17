import { IsString, IsOptional, IsEnum, IsInt, MaxLength } from 'class-validator';

export class CreatePinkmongDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_url?: string;

  @IsString()
  explain: string;

  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme: string;

  @IsEnum(['common', 'rare', 'epic', 'legendary'])
  grade: string;

  @IsInt()
  point: number;
}

