import { Achievement } from '../entities/achievement.entity'; 
import { Type, Transform } from 'class-transformer';
import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { IsISO8601,IsString, IsEnum, IsDateString, IsDate } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { AchievementCategory} from '../enums/achievement-category.enum';

export class CreateAchievementDto extends PickType(Achievement, ['expiration_at','title', 'content', 'category','reward'] as const) {//,'expiration_at'

  @ApiProperty({ example: '대전 빵집투어어' })
  @IsString()
title:string;

@ApiProperty({ example: 'FOOD_TOUR'}) // 예제 추가
@IsEnum(AchievementCategory, { message: 'category 값이 유효하지 않습니다. (SEOUL_TOUR, JEJU_TOUR, FOOD_TOUR 중 선택)' })
category: AchievementCategory;


@ApiProperty({ example: '제주도 1주일 길잡이!' })
@IsString()
content: string;

@ApiProperty({ example: 'pinkJam : 100' })
@IsString({message:'pinkJam : 100 처럼 적어주세요'})
reward:string;


// 날짜를 YYYY-MM-DD 형식으로 받음
/*
  @ApiProperty({ example: '2025-12-25' }) 
  @Transform(({ value }) => new Date(value).toISOString()) // 자동 변환 추가
  @IsDateString()
  expiration_at: string;  // ✅ string으로 유지
  */

  @IsDate()
  @Type(() => Date) // 문자열을 Date 객체로 변환
  expiration_at: Date;
}
