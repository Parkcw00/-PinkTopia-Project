import { IsNotEmpty, IsObject } from 'class-validator'; // 유효성 검사 데코레이터 추가
import { ApiProperty } from '@nestjs/swagger'; // Swagger 문서화를 위한 데코레이터 추가

// Reward 인터페이스 정의
export interface Reward {
  gem: number;
  dia: number;
}

// RewardAchievementC DTO 정의
export class RewardAchievementC {
  @ApiProperty({
    example: { gem: 100, dia: 50 },
    description: '보상 정보 (보석과 다이아)',
  })
  @IsObject() // 객체 형식인지 확인
  @IsNotEmpty() // 값이 비어있으면 안 됨
  reward: Reward;
}
