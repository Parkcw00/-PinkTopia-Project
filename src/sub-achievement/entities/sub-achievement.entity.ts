import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';
import { Achievement } from 'src/achievement/entities/achievement.entity';
import { AchievementP } from 'src/achievement-p/entities/achievement-p.entity';

@Entity({ name: 'sub-achievement' })
export class SubAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.sub_achievement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @Column({ type: 'int', nullable: false })
  achievement_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  conditions: string; // `linestring` → `varchar`로 변경

  @Column({
    type: 'enum',
    enum: SubAchievementMissionType,
    nullable: false,
  })
  mission_type: SubAchievementMissionType;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(
    () => AchievementP,
    (achievement_p) => achievement_p.sub_achievement,
  ) // 카드 엔티티와 1:n 관계 설정
  achievement_p: AchievementP[];
}
