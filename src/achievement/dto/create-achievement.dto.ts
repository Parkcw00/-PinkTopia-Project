import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { IsString, IsEnum, IsDateString } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { Achievement } from '../entities/achievement.entity'; 
import { AchievementCategory} from '../enums/achievement-category.enum';

export class CreateAchievementDto extends PickType(Achievement, ['title', 'content', 'category','reward','expiration_at'] as const) {

  @ApiProperty({ example: '대전 빵집투어어' })
  @IsString()
title:string;

@ApiProperty({ example: AchievementCategory.christmas }) // 예제 추가
@IsEnum(AchievementCategory)
category: AchievementCategory;

@ApiProperty({ 
  example: `성심당 빵집 순례부터 ~~~~ 까지! 
튀김소보로, 과일시루케이크, 빵먹고싶다` 
}) 
@IsString() 
content: string;

@ApiProperty({ example: 'pinkJam : 100' })
@IsString()
reward:string;

// IsDateString 타입 사용 예제
//const validData = { eventDate: '2025-01-01T10:00:00.000Z' }; // ✅ 유효함
//const invalidData = { eventDate: '2025-01-01' }; // ✅ 이것도 허용됨
//const invalidFormat = { eventDate: 'random string' }; // ❌ 유효하지 않음
// ISO 8601 형식의 날짜 문자열을 허용 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss.sssZ)
@ApiProperty({ example: '2025-12-25' })
@IsDateString() 
expiration_date: Date

}
