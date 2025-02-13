import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { Chatting } from 'src/chatting/entities/chatting.entity';
import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chatting, AchievementC])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
