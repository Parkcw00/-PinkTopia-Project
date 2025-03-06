import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { DirectionModule } from './direction/direction.module';
import { RankingModule } from './ranking/ranking.module';
import { ChattingRoomModule } from './chattingroom/chattingroom.module';
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
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AchievementCModule } from './achievement-c/achievement-c.module';
import { StoreItemModule } from './store-item/store-item.module';
import { S3Module } from './s3/s3.module';
import { LocationHistoryModule } from './location-history/location-history.module';
import { ValkeyModule } from './valkey/valkey.module';
import { PinkmongAppearLocationModule } from './pinkmong-appear-location/pinkmong-appear-location.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { PaymentModule } from './payment/payment.module';
import { GeoModule } from './geo/geo.module';

const typeOrmModuleOptions = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/entities/*.{ts,js}'], // 이곳에서 자신의 작업물의 엔티티 등록  -  자동으로 entities폴더 에서 엔티티파일 등록
    // entities: [
    //   process.env.NODE_ENV === 'production' // 환경에 따라 엔티티 경로를 다르게 설정하기
    //     ? 'dist/**/*.entity.js' // 배포 환경에서는 컴파일된 파일 사용 - dist 폴더 사용
    //     : 'src/**/*.entity.ts',  // 개발 환경에서는 TypeScript 파일 사용 - src 폴더 안에 있음음 사용
    // ],
    synchronize: true,
    // migrations: [__dirname + '/**/migrations/*.{ts,js}'], // 모든 폴더 내의 migrations 폴더에서 마이그레이션 파일을 자동으로 등록
    migrationsRun: !configService.get('DB_SYNC'), // 앱 실행 시 마이그레이션 적용
    dropSchema: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
        TOSS_SECRET_KEY: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
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
    AchievementCModule,
    ChattingModule,
    ChattingRoomModule,
    RankingModule,
    DirectionModule,
    ChatmemberModule,
    ChatblacklistModule,
    StoreItemModule,
    S3Module,
    LocationHistoryModule,
    ValkeyModule,
    PinkmongAppearLocationModule,
    InquiryModule,
    PaymentModule,
    GeoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
