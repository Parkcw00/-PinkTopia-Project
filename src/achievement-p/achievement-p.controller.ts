import {
  Controller,
  Get,  Res,
  Request,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import {AdminGuard} from '../user/guards/admin.guard'
import { AchievementPService } from './achievement-p.service';
import { CreateAchievementPDto } from './dto/create-achievement-p.dto';
import { UpdateAchievementPDto } from './dto/update-achievement-p.dto';


@Controller('achievement-p')
export class AchievementPController {
  constructor(private readonly APService: AchievementPService) {}

  // 수행으로 등록  
 // @UseGuards(UserGuard, AdminGuard)
  @Post('/subAchievementId/:subAchievementId')
  async post(
    @Request() request,
    @Param('subAchievementId') subAchievementId: string,
  ) {
    return this.APService.post(request.user.id, subAchievementId);
  }

  // 잘못 등록된 경우 삭제
 // @UseGuards(UserGuard, AdminGuard)
  @Delete('/subAchievementId/:subAchievementId')
  async deleteByUserNSub(
    @Request() request,
    @Param('subAchievementId') subAchievementId: string,
  ) {
    return this.APService.deleteByUserNSub(request.user.id, subAchievementId);
  }  
  // 잘못 등록된 경우 삭제
  //@UseGuards(UserGuard, AdminGuard)
  @Delete('chievement_p_Id/:achievementPId')
  async deleteByPId(
    @Request() request,
    @Param('achievementPId') achievementPId: string,
  ) {
    return this.APService.deleteByPId(achievementPId);
  }
}
