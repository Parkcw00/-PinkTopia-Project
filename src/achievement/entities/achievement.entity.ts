import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { AchievementCategory } from '../enums/achievement-category.enum'; // Enum 파일 import
import { SubAchievement } from 'src/sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@Entity({ name: 'achievement' })
export class Achievement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Column({
    type: 'enum',
    enum: AchievementCategory,
    nullable: false,
  })
  category: AchievementCategory;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Column({ type: 'varchar', length: 255, nullable: false })
  reward: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @CreateDateColumn()
  updated_at: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @CreateDateColumn()
  created_at: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(
    () => SubAchievement,
    (sub_achievement) => sub_achievement.achievement,
  ) // 카드 엔티티와 1:n 관계 설정
  sub_achievement: SubAchievement[];

  @OneToMany(() => AchievementC, (achievement_c) => achievement_c.achievement) // 카드 엔티티와 1:n 관계 설정
  achievement_c: AchievementC[];
}
