import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'achievementP' })
export class AchievementP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  subAchievementId: number; // camelCase 스타일로 변경

  @Column({ type: 'boolean', default: false, nullable: false }) // default 값 수정
  complete: boolean;
}
