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
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AchievementCModule } from './achievement-c/achievement-c.module';
import { UploadModule } from './upload/upload.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/entities/*.{ts,js}'], // 이곳에서 자신의 작업물의 엔티티 등록  -  경로 잘못??
    // entities: [
    //   process.env.NODE_ENV === 'production'
    //     ? 'dist/**/*.entity.js' // 배포 환경에서는 dist 폴더 사용
    //     : 'src/**/*.entity.ts',  // 개발 환경에서는 src 사용
    // ],
    /// 개발, dev 인
    synchronize: configService.get('DB_SYNC'), //true, // 기존 테이블이 있다면 자동으로 수정됨
    // migrationsRun: true, // 앱 실행 시 마이그레이션 적용

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
      }),
    }),

    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    PostModule,
    CommentModule,
    UserModule,
    EventModule,
    PinkmongModule,
    AchievementModule,
    AchievementCModule,
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
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
