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

  // 선택적 속성으로 표시 (질문 부호 추가)
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsEnum(['forest', 'desert', 'ocean', 'mountain', 'city'])
  region_theme?: string;
}
