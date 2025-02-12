import { PartialType } from '@nestjs/mapped-types';
import { CreateAchievementPDto } from './create-achievement-p.dto';

export class UpdateAchievementPDto extends PartialType(CreateAchievementPDto) {}
