import { PartialType } from '@nestjs/mapped-types';
import { CreateSubAchievementDto } from './create-sub-achievement.dto';

export class UpdateSubAchievementDto extends PartialType(
  CreateSubAchievementDto,
) {}
