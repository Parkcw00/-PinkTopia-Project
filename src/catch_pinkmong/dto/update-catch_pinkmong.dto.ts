import { PartialType } from '@nestjs/mapped-types';
import { CreateCatchPinkmongDto } from './create-catch_pinkmong.dto';

export class UpdateCatchPinkmongDto extends PartialType(CreateCatchPinkmongDto) {}
