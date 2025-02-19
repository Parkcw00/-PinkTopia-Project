import { SubAchievement } from 'src/sub-achievement/entities/sub-achievement.entity';
import { Achievement } from 'src/achievement/entities/achievement.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'achievementP' })
export class AchievementP {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.achievement_p, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @ManyToOne(
    () => SubAchievement,
    (sub_achievement) => sub_achievement.achievement_p,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'sub_achievement_id' })
  sub_achievement: SubAchievement;

  @Column({ type: 'int', nullable: false })
  sub_achievement_id: number; // camelCase 스타일로 변경

// 업적id
  @ManyToOne(() => Achievement, (achievement) => achievement.achievement_c, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;//

  @Column({ type: 'int', nullable: false })
  achievement_id: number;//

  @Column({ type: 'boolean', default: false, nullable: false }) // default 값 수정
  complete: boolean;
}
