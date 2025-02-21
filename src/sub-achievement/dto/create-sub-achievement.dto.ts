import { Type, Transform } from 'class-transformer';
import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsISO8601,
  IsString,
  IsEnum,
  IsDateString,
  IsDate,
} from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { SubAchievement } from '../entities/sub-achievement.entity'; // 클래스명 수정
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';

export class CreateSubAchievementDto extends PickType(SubAchievement, [
  'expiration_at',
  'achievement_id',
  'title',
  'conditions',
  'mission_type',
] as const) {
  @ApiProperty({ example: 1 })
  @IsInt() // 정수만 허용
  @Type(() => Number) // 🔥 문자열을 숫자로 변환
  achievement_id: number;

  @ApiProperty({ example: 'OOO빵집 방문' })
  @IsString()
  title: string;

  @ApiProperty({ example: SubAchievementMissionType.COMPLETE_TASK }) // 예제 추가
  mission_type: SubAchievementMissionType;

  @ApiProperty({ example: 'Lat: 36.3306, Lon: 127.4256 ' })
  @IsString()
  conditions: string;

  @IsDate()
  @Type(() => Date) // 문자열을 Date 객체로 변환
  expiration_at: Date;
}
