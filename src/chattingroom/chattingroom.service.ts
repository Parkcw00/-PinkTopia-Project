import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChattingRoomRepository } from './chattingroom.repository';

@Injectable()
export class ChattingRoomService {
  constructor(
    private readonly chattingRoomRepository: ChattingRoomRepository,
    @InjectDataSource()
    private dataSource: DataSource,
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
}
