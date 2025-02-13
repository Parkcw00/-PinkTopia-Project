import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Chatting } from 'src/chatting/entities/chatting.entity';
import { AchievementC } from 'src/achievement-c/entities/achievement-c.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Chatting)
    private chattingRepository: Repository<Chatting>,
    @InjectRepository(AchievementC)
    private achievementCRepository: Repository<AchievementC>,
    // 필요할 것 같은 레포지토리들
  ) {}

  //랭킹조회
  async findUsersByCollectionPoint(): Promise<User[]> {
    return this.userRepository.find({
      order: {
        collection_point: 'ASC',
      },
    });
  }
  // 닉네임으로 찾기
  async findNickname(nickname: string) {
    return await this.userRepository.findOne({
      where: { nickname },
    });
  }

  // 이메일로 찾기
  async findEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // 회원정보 추가
  async signUp(
    nickname: string,
    email: string,
    password: string,
    birthday?: Date,
  ) {
    return await this.userRepository.save({
      nickname,
      email,
      password,
      ...(birthday && { birthday }),
    });
  }
}
