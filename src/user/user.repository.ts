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
}
