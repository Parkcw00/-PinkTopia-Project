import { PartialType } from '@nestjs/mapped-types';
import { CreatePinkmongDto } from './create-pinkmong.dto';

export class UpdatePinkmongDto extends PartialType(CreatePinkmongDto) {}
