import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AchievementCategory } from '../enums/achievement-category.enum'; // Enum 파일 import

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
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @CreateDateColumn()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @DeleteDateColumn()
  deletedAt: Date;
}
