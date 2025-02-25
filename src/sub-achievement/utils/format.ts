import { SubAchievement } from '../entities/sub-achievement.entity';

export const fixresArr = (
  data: SubAchievement[],
): Pick<
  SubAchievement,
  | 'id'
  | 'achievement'
  | 'achievement_id'
  | 'title'
  | 'longitude'
  | 'latitude'
  | 'sub_achievement_images'
  | 'mission_type'
  | 'expiration_at'
  | 'updated_at'
  | 'created_at'
  | 'deleted_at'
  | 'achievement_p'
>[] => {
  return data.map((item) => ({
    id: item.id,
    achievement_id: item.achievement_id,
    title: item.title,
    longitude: item.longitude,
    latitude: item.latitude,
    sub_achievement_images: item.sub_achievement_images,
    mission_type: item.mission_type,
    expiration_at: item.expiration_at ?? null,
    updated_at: item.updated_at,
    created_at: item.created_at,
    deleted_at: item.deleted_at ?? null,
    achievement: item.achievement ?? null,
    achievement_p: item.achievement_p ?? null,
  }));
};

export const fixres = (
  data: SubAchievement,
): Pick<
  SubAchievement,
  | 'id'
  | 'achievement'
  | 'achievement_id'
  | 'title'
  | 'longitude'
  | 'latitude'
  | 'sub_achievement_images'
  | 'mission_type'
  | 'expiration_at'
  | 'updated_at'
  | 'created_at'
  | 'deleted_at'
  | 'achievement_p'
> => ({
  id: data.id,
  achievement_id: data.achievement_id,
  title: data.title,
  longitude: data.longitude,
  latitude: data.latitude,
  sub_achievement_images: data.sub_achievement_images,
  mission_type: data.mission_type,
  expiration_at: data.expiration_at ?? null,
  updated_at: data.updated_at,
  created_at: data.created_at,
  deleted_at: data.deleted_at ?? null,
  achievement: data.achievement ?? null,
  achievement_p: data.achievement_p ?? null,
});
