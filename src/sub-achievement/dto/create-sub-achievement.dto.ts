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
  Min,
  Max,
  IsDate,
} from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { SubAchievement } from '../entities/sub-achievement.entity'; // 클래스명 수정
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';

export class CreateSubAchievementDto extends PickType(SubAchievement, [
  'achievement_id',
  'title',
  'mission_type',
  'longitude',
  'content',
  'latitude',
  // 'expiration_at',
] as const) {
  @ApiProperty({ example: 1 })
  @IsInt() // 정수만 허용
  @Type(() => Number) // 🔥 문자열을 숫자로 변환
  achievement_id: number;

  @ApiProperty({ example: 'OOO빵집 방문' })
  @IsString()
  title: string;

  @ApiProperty({ example: '시루케이크 맛있음' })
  @IsString()
  content: string;

  @ApiProperty({ description: '위도', minimum: -90, maximum: 90 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: '경도', minimum: -180, maximum: 180 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: '업로드할 파일들',
  })
  files?: Express.Multer.File[];

  @ApiProperty({ example: SubAchievementMissionType.COMPLETE_TASK }) // 예제 추가
  @IsEnum(SubAchievementMissionType, {
    message:
      'category 값이 유효하지 않습니다. (SEOUL_TOUR, JEJU_TOUR, FOOD_TOUR 중 선택)',
  })
  mission_type: SubAchievementMissionType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : null))
  expiration_at?: Date;
}
