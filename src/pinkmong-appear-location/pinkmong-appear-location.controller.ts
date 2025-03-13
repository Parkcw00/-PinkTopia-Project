import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { PinkmongAppearLocationService } from 'src/pinkmong-appear-location/pinkmong-appear-location.service';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

@Controller('pinkmong-appear-location')
export class PinkmongAppearLocationController {
  constructor(private readonly service: PinkmongAppearLocationService) {}

  // db 읽어서 발키로 다 올리는 로직 추가
  //@UseGuards(UserGuard, AdminGuard)
  @Post('fill-valkey')
  async fillValkey() {
    return await this.service.fillValkey();
  }

  @Post()
  async createLocation(
    @Body() dto: CreatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    return this.service.createLocation(dto);
  }
  @Post('add1000')
  async createLocation2() {
    try {
      for (let i = 0; i < 1000; i++) {
        let dto = {
          title: `test핑크몽2${i}`,
          latitude: 35.1961088 + 0.0 * 0.0 * 0.0 * 0.0 * 0.0 * 0.0 * 0.0 * i,
          longitude: 128.12288,
          region_theme: 'ocean',
        };
        await this.service.createLocation(dto);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  async getAllLocations(): Promise<PinkmongAppearLocation[]> {
    return this.service.getAllLocations();
  }

  @Get('getOne')
  async getOne(
    @Query('user_email') user_email: string, // 쿼리 파라미터에서 이메일 받기
  ): Promise<{ id: number } | undefined> {
    console.log(`C - 이메일(${user_email})로 북마커 ID 가져오기`);
    return this.service.findOneByEmail(user_email);
  }

  @Patch(':id')
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    return this.service.updateLocation(id, updateDto);
  }

  @Delete()
  async deleteLocation(@Query('id') id: number): Promise<void> {
    console.log('C - 삭제!!!', id);
    return this.service.deleteLocation(id);
  }
}
