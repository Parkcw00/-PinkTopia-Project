import { SubAchievement } from 'src/sub-achievement/entities/sub-achievement.entity';
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
  userId: number;

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
  subAchievementId: number; // camelCase 스타일로 변경

  @Column({ type: 'boolean', default: false, nullable: false }) // default 값 수정
  complete: boolean;
}
