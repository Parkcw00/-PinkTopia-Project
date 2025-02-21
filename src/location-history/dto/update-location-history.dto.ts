import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationHistoryDto } from './create-location-history.dto';

export class UpdateLocationHistoryDto extends PartialType(CreateLocationHistoryDto) {}
