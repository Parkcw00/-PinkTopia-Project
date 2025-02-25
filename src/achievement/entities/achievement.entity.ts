import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { AchievementCategory } from '../enums/achievement-category.enum'; // Enum 파일 import
import { SubAchievement } from 'src/sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';
@Entity({ name: 'achievement' })
@Unique(['title'])
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'json', nullable: true })
  achievement_images: string[];

  @Column({
    type: 'enum',
    enum: AchievementCategory,
    nullable: false,
  })
  category: AchievementCategory;

  @Column({ type: 'varchar', length: 255, nullable: false })
  reward: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  // 만료일 컬럼 추가, 자동생성 아님 2025-05-22
  @Column({ type: 'date', nullable: true })
  expiration_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(
    () => SubAchievement,
    (sub_achievement) => sub_achievement.achievement,
  ) // 카드 엔티티와 1:n 관계 설정
  sub_achievement: SubAchievement[];

  @OneToMany(() => AchievementC, (achievement_c) => achievement_c.achievement) // 카드 엔티티와 1:n 관계 설정
  achievement_c: AchievementC[];
  static achievement_images: any;
}
