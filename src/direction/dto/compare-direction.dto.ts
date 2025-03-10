/**필요한 매게변수
user_direction : 사용자의 좌표 {위도(숫자):경도(숫자)}
bookmark_direction : 비교할 북마커 들의 좌표 배열 [{위도(숫자):경도(숫자)},...] */

import { IsArray, IsNumber, IsObject, ValidateNested } from 'class-validator';
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

// export class CompareDirection {
//   @ValidateNested()
//   @IsObject()
//   @Type(() => CoordinatesDto)
//   user_direction: CoordinatesDto;
/*
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinatesDto)
  bookmark_direction: CoordinatesDto[];*/
