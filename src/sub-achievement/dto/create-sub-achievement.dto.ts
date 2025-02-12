import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { IsNumber, IsString } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { SubAchievement } from '../entities/sub-achievement.entity'; // 클래스명 수정
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';

export class CreateSubAchievementDto extends PickType(SubAchievement, ['achievement_id', 'title', 'conditions', 'mission_type'] as const) {

  @ApiProperty({ example: 1 })
  @IsNumber() // 데코레이터 사용 ( 숫자 타입 )
  achivment_id:number

  @ApiProperty({ example: 'OOO빵집 방문' })
  @IsString() // 데코레이터 사용 ( 문자열 타입 )
title:string;


@ApiProperty({ example: SubAchievementMissionType.COMPLETE_TASK }) // 예제 추가
mission_type: SubAchievementMissionType;

@ApiProperty({ example: 'Lat: 36.3306, Lon: 127.4256 ' })
@IsString() // 데코레이터 사용 ( 문자열 타입 )
conditions:string;
}
