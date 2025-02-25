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
  Unique,
} from 'typeorm';
import { SubAchievementMissionType } from '../enums/sub-achievement-mission-type.enum';
import { Achievement } from 'src/achievement/entities/achievement.entity';
import { AchievementP } from 'src/achievement-p/entities/achievement-p.entity';

@Entity({ name: 'sub-achievement' })
@Unique(['title']) // 유니크 추가
export class SubAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Achievement, (achievement) => achievement.sub_achievement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @Column({ type: 'int', nullable: false })
  achievement_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  conditions: string;

  @Column({
    type: 'enum',
    enum: SubAchievementMissionType,
    nullable: false,
  })
  mission_type: SubAchievementMissionType;

  // 만료일 컬럼 추가
  @Column({ type: 'date', nullable: true })
  expiration_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(
    () => AchievementP,
    (achievement_p) => achievement_p.sub_achievement,
  ) // 카드 엔티티와 1:n 관계 설정
  achievement_p: AchievementP[];
}
