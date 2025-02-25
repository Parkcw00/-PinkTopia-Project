import { PartialType } from '@nestjs/swagger';
import { CreatePinkmongAppearLocationDto } from './create-pinkmong-appear-location.dto';

export class UpdatePinkmongAppearLocationDto extends PartialType(CreatePinkmongAppearLocationDto) {}
