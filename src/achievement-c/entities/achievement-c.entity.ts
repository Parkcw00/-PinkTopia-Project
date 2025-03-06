import { Achievement } from '../../achievement/entities/achievement.entity';
import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'achievementC' })
export class AchievementC {
  @PrimaryGeneratedColumn()
  id: number; //

  @ManyToOne(() => User, (user) => user.achievement_c, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User; //

  @Column({ type: 'int', nullable: false })
  user_id: number; //

  @ManyToOne(() => Achievement, (achievement) => achievement.achievement_c, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement; //

  @Column({ type: 'int', nullable: false })
  achievement_id: number; //

  @CreateDateColumn()
  created_at: Date; //
}
