import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';

@Entity({ name: 'sub-achievement' })
export class SubAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  achievementId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  conditions: string; // `linestring` → `varchar`로 변경

  @Column({
    type: 'enum',
    enum: SubAchievementMissionType,
    nullable: false,
  })
  missionType: SubAchievementMissionType;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
