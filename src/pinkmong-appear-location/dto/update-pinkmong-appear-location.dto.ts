import { PartialType } from '@nestjs/swagger';
import { CreatePinkmongAppearLocationDto } from './create-pinkmong-appear-location.dto';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export class UpdatePinkmongAppearLocationDto extends PartialType(
  CreatePinkmongAppearLocationDto,
) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: string;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: string;

  @IsOptional()
  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme?: string;
}
