import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CompareDirection {
  @ValidateNested()
  @Type(() => CoordinatesDto)
  user_direction: CoordinatesDto; // 단일 객체로 수정
}
