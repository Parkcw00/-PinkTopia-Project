import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../entities/achievement.entity';
import { SubAchievement } from '../../sub-achievement/entities/sub-achievement.entity';
import { AchievementService } from '../achievement.service';
import { AchievementController } from '../achievement.controller';
import { AchievementC } from '../../achievement-c/entities/achievement-c.entity';
import { AchievementRepository } from '../achievement.repository';

export const fixresArr = (
  data: Achievement[],
): Pick<
  Achievement,
  | 'id'
  | 'title'
  | 'category'
  | 'achievement_images'
  | 'content'
  | 'expiration_at'
  | 'reward'
  | 'expiration_at'
  | 'updated_at'
  | 'created_at'
  | 'deleted_at'
  | 'sub_achievement'
  | 'achievement_c'
>[] => {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
    reward: item.reward,
    achievement_images: item.achievement_images,
    expiration_at: item.expiration_at ?? undefined,
    updated_at: item.updated_at,
    created_at: item.created_at,
    deleted_at: item.deleted_at ?? undefined,
    sub_achievement: item.sub_achievement,
    achievement_c: item.achievement_c,
  }));
};

export const fixres = (
  data: Achievement,
): Pick<
  Achievement,
  | 'id'
  | 'title'
  | 'category'
  | 'achievement_images'
  | 'content'
  | 'reward'
  | 'expiration_at'
  | 'updated_at'
  | 'created_at'
  | 'deleted_at'
  | 'sub_achievement'
  | 'achievement_c'
> => ({
  id: data.id,
  title: data.title,
  category: data.category,
  content: data.content,
  achievement_images: data.achievement_images,
  reward: data.reward,
  expiration_at: data.expiration_at ?? undefined,
  updated_at: data.updated_at,
  created_at: data.created_at,
  deleted_at: data.deleted_at ?? undefined,
  sub_achievement: data.sub_achievement,
  achievement_c: data.achievement_c,
});
