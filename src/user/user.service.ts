import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private configService: ConfigService,
  ) {}

  async getRanking() {
    return await this.userRepository.findUsersByCollectionPoint();
  }

  async getRankingAchievement() {
    return await this.userRepository.findUsersByAchievement();
  }

  // 회원가입
  async signUp(createUserDto: CreateUserDto) {
    const { nickname, email, password, confirmedPassword, birthday } =
      createUserDto;

    if (password !== confirmedPassword) {
      throw new BadRequestException('입력한 비밀번호가 일치하지 않습니다.');
    }

    const existNickname = await this.userRepository.findNickname(nickname);
    if (existNickname) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const existEmail = await this.userRepository.findEmail(email);
    if (existEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(password, Number(saltRounds));

    try {
      await this.userRepository.signUp(
        nickname,
        email,
        hashedPassword,
        birthday,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        '유저 정보 저장 중 오류가 발생하였습니다.',
      );
    }
  }

  // 이메일 인증 코드 전송
  async sendCode(email: string, password: string) {
    if(!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if(!password) {
      throw new BadRequestException('비밀번호를 입력해 주세요');
    }

    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }
    
    const isPasswordMatched = bcrypt.compareSync(password, existEmail.password)
    if(!isPasswordMatched) {
      throw new BadRequestException('일치하지 않는 사용자입니다.');
    }

    if(existEmail.email_verify === true) {
      throw new BadRequestException('이미 인증을 완료한 사용자입니다.')
    }

    try {
      const verificationCode = await this.sendVerificationCode(email);
      await this.userRepository.updateVerificationCode(email, verificationCode);
      return { message: `${email}로 인증코드를 발송하였습니다.` };
    } catch (err) {
      throw new InternalServerErrorException(
        '이메일 전송 중 오류가 발생하였습니다.',
      );
    }
  }

  // 이메일 인증
  async verifyCode(email: string, verificationCode: string) {
    if(!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if(!verificationCode) {
      throw new BadRequestException('인증코드를 입력해 주세요');
    }
    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }
    if(existEmail.email_verify === true) {
      throw new BadRequestException('이미 인증을 완료한 사용자입니다.')
    }
    if(existEmail.verification_code !== verificationCode) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.')
    }

    try {
      await this.userRepository.successVerification(email);
      return {message: `이메일 인증 성공. 가입이 완료되었습니다.`}
    } catch (err) {
      throw new InternalServerErrorException(
        '이메일 인증 중 오류가 발생하였습니다.',
      );
    }
  }

  // 로그인
  async logIn(email: string, password: string) {
    if(!email) {
      throw new BadRequestException('이메일을 입력해 주세요');
    }
    if(!password) {
      throw new BadRequestException('비밀번호를 입력해 주세요');
    }

    const existEmail = await this.userRepository.findEmail(email);
    if (!existEmail) {
      throw new BadRequestException('존재하는지 않는 이메일입니다.');
    }
    
    const isPasswordMatched = bcrypt.compareSync(password, existEmail.password)
    if(!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 틀렸습니다.');
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // 인증 코드 메일 보내는 메서드
  private async sendVerificationCode(email: string) {
    const EMAIL_SERVICE = this.configService.get<string>('EMAIL_SERVICE');
    const NODEMAILER_USER = this.configService.get<string>('NODEMAILER_USER');
    const NODEMAILER_PASS = this.configService.get<string>('NODEMAILER_PASS');
    const transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS,
      },
    });

    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    characters = characters + characters.slice(26).repeat(2);
    let verificationCode = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      verificationCode += characters[randomIndex];
    }

    const mailOptions = {
      from: NODEMAILER_USER,
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `<h1>인증 코드는 <strong>${verificationCode}</strong> 입니다.</h1>`,
    };
    await transporter.sendMail(mailOptions);

    return verificationCode;
  }
}
