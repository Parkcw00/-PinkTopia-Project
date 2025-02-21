import { IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';

export class CreatePinkmongAppearLocationDto {
  @IsString()
  title: string;

  @IsString()
  @Min(-90)
  @Max(90)
  latitude: string;

  @IsString()
  @Min(-180)
  @Max(180)
  longitude: string;

  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme: string;
}
