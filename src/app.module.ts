import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { DirectionModule } from './direction/direction.module';
import { RankingModule } from './ranking/ranking.module';
import { ChattingroomModule } from './chattingroom/chattingroom.module';
import { ChattingModule } from './chatting/chatting.module';
import { AchievementPModule } from './achievement-p/achievement-p.module';
import { SubAchievementModule } from './sub-achievement/sub-achievement.module';
import { CatchPinkmongModule } from './catch_pinkmong/catch_pinkmong.module';
import { CollectionModule } from './collection/collection.module';
import { InventoryModule } from './inventory/inventory.module';
import { ItemModule } from './item/item.module';
import { AchievementCompleteModule } from './achievement_complete/achievement_complete.module';
import { AchievementCheckListModule } from './achievement_check_list/achievement_check_list.module';
import { AchievementModule } from './achievement/achievement.module';
import { PinkmongModule } from './pinkmong/pinkmong.module';
import { EventModule } from './event/event.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    PostModule,
    CommentModule,
    UserModule,
    EventModule,
    PinkmongModule,
    AchievementModule,
    AchievementCheckListModule,
    AchievementCompleteModule,
    ItemModule,
    InventoryModule,
    CollectionModule,
    CatchPinkmongModule,
    SubAchievementModule,
    AchievementPModule,
    ChattingModule,
    ChattingroomModule,
    RankingModule,
    DirectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
