import { PartialType } from '@nestjs/mapped-types';
import { CreateChattingroomDto } from './create-chattingroom.dto';

export class UpdateChattingroomDto extends PartialType(CreateChattingroomDto) {}
