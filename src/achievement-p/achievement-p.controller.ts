import {
  Controller,
  Request,
  Post,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import { AchievementPService } from './achievement-p.service';

@Controller('achievement-p')
export class AchievementPController {
  constructor(private readonly APService: AchievementPService) {}

  // 수행으로 등록
  @UseGuards(UserGuard)
  @Post('/subAchievementId/:subAchievementId')
  async post(
    @Request() req,
    @Param('subAchievementId') subAchievementId: number,
  ) {
    console.log('P 생성 컨트롤러');
    return this.APService.post(req.user.id, subAchievementId);
  }

  // 잘못 등록된 경우 삭제
  @UseGuards(UserGuard)
  @Delete('/subAchievementId/:subAchievementId')
  async deleteByUserNSub(
    @Request() req,
    @Param('subAchievementId') subAchievementId: number,
  ) {
    return this.APService.deleteByUserNSub(req.user.id, subAchievementId);
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
