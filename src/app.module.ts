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
import { AchievementModule } from './achievement/achievement.module';
import { PinkmongModule } from './pinkmong/pinkmong.module';
import { EventModule } from './event/event.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { ChatmemberModule } from './chatmember/chatmember.module';
import { ChatblacklistModule } from './chatblacklist/chatblacklist.module';

@Module({
  imports: [
    PostModule,
    CommentModule,
    UserModule,
    EventModule,
    PinkmongModule,
    AchievementModule,
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
    ChatmemberModule,
    ChatblacklistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
