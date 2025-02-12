import { PartialType } from '@nestjs/mapped-types';
import { CreateAchievementCDto } from './create-achievement-c.dto';

export class UpdateAchievementCDto extends PartialType(CreateAchievementCDto) {}
