import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController, UsersController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserGuard } from './guards/user-guard';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ValkeyService } from 'src/valkey/valkey.service';
import { AchievementCRepository } from 'src/achievement-c/achievement-c.repository';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, AchievementC]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    InventoryModule,
    ValkeyModule,
  ],
  controllers: [UserController, UsersController],
  providers: [UserService, UserRepository, UserGuard, ValkeyService],
  exports: [
    UserGuard,
    JwtModule,
    UserRepository,
    UserService,
    TypeOrmModule.forFeature([UserRepository]),
  ],
})
export class UserModule {}
