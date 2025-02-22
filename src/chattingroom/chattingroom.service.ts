import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChattingRoomRepository } from './chattingroom.repository';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ChattingRoomService {
  constructor(
    private readonly chattingRoomRepository: ChattingRoomRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  // 채팅방 생성
  async createChattingRoom(user: any) {
    const chattingRoom = await this.chattingRoomRepository.createChattingRoom();
    const addChatMember = await this.chattingRoomRepository.addChatMember(
      chattingRoom.id,
      user.id,
    );
    return { message: `채팅방이 생성되었습니다.` };
  }

  // 채팅방 조회
  async getChattingRoom(user: any) {
    // Fetch all chat member entries for the user
    const chatMembers =
      await this.chattingRoomRepository.findChatMemberByUserId(user.id);

    // Extract chat room IDs from the chat member entries
    const chattingRoomIds = chatMembers.map(
      (member) => member.chatting_room_id,
    );

    // Fetch chat rooms and their members' nicknames
    const chattingRooms = await Promise.all(
      chattingRoomIds.map(async (id) => {
        const room = await this.chattingRoomRepository.findChattingRoomById(id);
        if (!room) return null;

        const members =
          await this.chattingRoomRepository.findAllChatMembers(id);
        const memberNicknames = await Promise.all(
          members.map(async (member) => {
            const user = await this.chattingRoomRepository.findId(
              member.user_id,
            );
            return user?.nickname || 'Unknown';
          }),
        );

        // Include the title in the returned object
        return {
          id: room.id,
          title: room.title,
          members: memberNicknames.join(', '),
        };
      }),
    ).then((rooms) => rooms.filter((room) => room !== null));

    return { message: `채팅방 목록입니다.`, chattingRooms };
  }

  // 채팅방 나가기
  async outChattingRoom(user: any, chattingRoomId: number) {
    const isMember = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      user.id,
    );

    if (!isMember) {
      throw new BadRequestException('이미 해당 채팅방의 멤버가 아닙니다.');
    }

    await this.chattingRoomRepository.deleteChatMember(chattingRoomId, user.id);
    const members =
      await this.chattingRoomRepository.findAllChatMembers(chattingRoomId);

    if (isMember.admin === true && members.length > 0) {
      const randomNumber = Math.floor(Math.random() * members.length);
      const newAdmin = members[randomNumber].user_id;
      await this.chattingRoomRepository.getAdmin(chattingRoomId, newAdmin);
    } else if (members.length === 0) {
      await this.chattingRoomRepository.deleteChattingRoom(chattingRoomId);
      return { message: `채팅방을 나가셨습니다. 채팅방이 삭제되었습니다.` };
    }
    return { message: `채팅방을 나가셨습니다.` };
  }

  // 채팅방 삭제
  async deleteChattingRoom(user: any, chattingRoomId: number) {
    const isMember = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      user.id,
    );

    if (!isMember) {
      throw new BadRequestException('해당 채팅방의 멤버가 아닙니다.');
    }
    if (isMember.admin !== true) {
      throw new BadRequestException('채팅방 삭제 권한이 없습니다.');
    }

    await this.chattingRoomRepository.deleteChattingRoom(chattingRoomId);
    return { message: '채팅방이 삭제되었습니다.' };
  }

  // 관리자 위임
  async changeAdmin(user: any, chattingRoomId: number, userId: number) {
    const isMember = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      user.id,
    );

    if (!isMember) {
      throw new BadRequestException('당신은 해당 채팅방의 멤버가 아닙니다.');
    }
    if (isMember.admin !== true) {
      throw new BadRequestException('관리자 위임 권한이 없습니다.');
    }

    const isMember2 = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      userId,
    );
    if (!isMember2) {
      throw new BadRequestException(
        '선택한 유저는 해당 채팅방의 멤버가 아닙니다.',
      );
    }
    await this.chattingRoomRepository.deleteAdmin(chattingRoomId, user.id);
    await this.chattingRoomRepository.getAdmin(chattingRoomId, userId);
    return { message: `${userId}님에게 관리자 권한을 위임하였습니다.` };
  }

  // 채팅방 URL 원하는 유저한테 보내기
  async sendInviteUrl(
    user: any,
    chattingRoomId: number,
    receiveUserId: number,
  ) {
    const isMember = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      user.id,
    );

    if (!isMember) {
      throw new BadRequestException('당신은 해당 채팅방의 멤버가 아닙니다.');
    }

    const isExist = await this.chattingRoomRepository.findId(receiveUserId);
    if (!isExist) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }

    const isMember2 = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      receiveUserId,
    );
    if (isMember2) {
      throw new BadRequestException(
        '선택한 유저는 이미 해당 채팅방의 멤버입니다.',
      );
    }

    const sendUser = await this.chattingRoomRepository.findId(user.id);
    if (!sendUser) {
      throw new InternalServerErrorException('관리자에게 문의해 주세요.');
    }

    try {
      await this.sendEmail(
        isExist.email,
        sendUser.nickname,
        isExist.nickname,
        chattingRoomId,
      );
      return { message: '초대 메일을 발송하였습니다.' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        '메일 전송 중 오류가 발생하였습니다.',
      );
    }
  }

  // url 받아 접속한 멤버 채팅룸에 join
  async joinChattingRoom(user: any, chattingRoomId: number) {
    const existChattingRoom =
      await this.chattingRoomRepository.checkChattingRoom(chattingRoomId);
    if (!existChattingRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    const isMember = await this.chattingRoomRepository.findChatMember(
      chattingRoomId,
      user.id,
    );
    if (isMember) {
      throw new BadRequestException(
        '선택한 유저는 이미 해당 채팅방의 멤버입니다.',
      );
    }

    try {
      await this.chattingRoomRepository.addChatMemberNotAdmin(
        chattingRoomId,
        user.id,
      );
      return { message: '채팅방 멤버가 되었습니다.' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        '채팅방 멤버가 추가에 실패하였습니다.',
      );
    }
  }

  // 초대 메일 보내는 메서드
  private async sendEmail(
    email: string,
    sendUserName: string,
    receiveUserName: string,
    chattingRoomId: number,
  ) {
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

    const inviteUrl = `${process.env.BASE_URL || 'http://localhost:3000/'}chattingroom/${chattingRoomId}/join`;

    const mailOptions = {
      from: NODEMAILER_USER,
      to: email,
      subject: `${chattingRoomId}번 채팅방에 초대합니다.`,
      html: `<h1>${sendUserName}님이 ${receiveUserName}을 ${chattingRoomId}번 채팅방으로 초대하셨습니다.</h1>
      <h2>초대링크: <a href="${inviteUrl}">${inviteUrl}</a></h2>`,
    };
    await transporter.sendMail(mailOptions);
  }
}
