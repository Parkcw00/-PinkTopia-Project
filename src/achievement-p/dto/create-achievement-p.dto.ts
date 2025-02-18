import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { IsInt, IsNotEmpty, IsBoolean, } from 'class-validator'; // 유효성 검사 데코레이터 추가
import { ApiProperty } from '@nestjs/swagger'; // Swagger 문서화를 위한 데코레이터 추가
import {AchievementP} from '../entities/achievement-p.entity'; 

export class CreateAchievementPDto extends PickType(AchievementP,['user_id', 'sub_achievement_id'] as const){
  
  // 유저id 는 토큰추가하면 삭제하기
  @ApiProperty({ example: 1, description: '유저의 ID' }) // Swagger 문서화
  @IsInt() // 정수 값이어야 함
  @IsNotEmpty() // 값이 비어있으면 안 됨
  user_id: number;

  @ApiProperty({ example: 100, description: '연결할 업적 ID' })
  @IsInt()
  @IsNotEmpty()
  sub_achievement_id: number; // camelCase 스타일로 변경
}
