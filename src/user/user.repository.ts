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
  async findUsersByCollectionPoint(): Promise<Partial<User>[]> {
    return await this.userRepository.find({
      select: ['nickname', 'collection_point'],
      order: {
        collection_point: 'DESC',
      },
    });
  }

  async findUsersByAchievement(): Promise<
    { nickname: string; achievementCount: number }[]
  > {
    const users = await this.userRepository.find({
      relations: ['achievement_c'],
      order: {
        achievement_c: {
          id: 'DESC',
        },
      },
    });
    return users.map((user) => ({
      nickname: user.nickname,
      achievementCount: user.achievement_c.length, // 달성 업적의 개수 계산
    }));
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

  // 유저 조회
  async findId(id: number) {
    return await this.userRepository.findOne({
      where: { id },
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

  // 회원정보 수정
  async updateMyInfo(
    email: string,
    nickname?: string,
    password?: string,
    profile_image?: string,
    birthday?: Date,
  ) {
    return await this.userRepository.update(
      { email },
      {
        ...(nickname && { nickname }),
        ...(password && { password }),
        ...(profile_image && { profile_image }),
        ...(birthday && { birthday }),
      },
    );
  }

  // 회원 탈퇴
  async deleteUser(email: string) {
    return await this.userRepository.delete({ email });
  }

  // 이메일 인증코드 업데이트
  async updateVerificationCode(email: string, verificationCode: string) {
    return await this.userRepository.update(
      { email },
      { verification_code: verificationCode },
    );
  }

  // 이메일 인증성공 후 email_verify true로 변경
  async successVerification(email: string) {
    return await this.userRepository.update({ email }, { email_verify: true });
  }
}
