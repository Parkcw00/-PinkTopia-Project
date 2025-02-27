import { PartialType } from '@nestjs/mapped-types';
import { CompareDirection } from './compare-direction.dto';

export class UpdateDirectionDto extends PartialType(CompareDirection) {}
