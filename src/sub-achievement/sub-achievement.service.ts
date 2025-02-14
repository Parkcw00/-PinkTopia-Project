import { Injectable, 
  NotFoundException,
  BadRequestException,
  ParseIntPipe, } from '@nestjs/common';;
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

import { SubAchievementRepository } from './sub-achievement.repository';
import { SubAchievement } from './entities/sub-achievement.entity';

@Injectable()
export class SubAchievementService {
  constructor(private readonly repository: SubAchievementRepository,) {}
  
  async create(createSubAchievementDto: CreateSubAchievementDto):Promise<SubAchievement>  {
   if(!createSubAchievementDto){
         throw new BadRequestException('올바른 데이터를 입력하세요.');
   }
       // title로 검색 -> 겹치나 확인
       const alreadyExists = await this.repository.findByTitle(createSubAchievementDto.title);
       // 있으면 throw
       if (alreadyExists) {
         throw new NotFoundException(`이미 있는 업적 이름 입니다.`);
       }
       // 새로운 엔터티 생성
     const achievement = await this.repository.create(createSubAchievementDto);
   if(!achievement){  
     throw new NotFoundException(`업적 생성 실패`);
   }
     // 데이터베이스에 저장
     return await this.repository.save(achievement);
    }
  


  async findOne(id: string):Promise<SubAchievement> {
    const idS = Number(id);
    if (!idS) {
      throw new BadRequestException('subAchievementId 값이 없거나 잘못된 형식 입니다');
    }
    const data = await this.repository.findOne(idS);
    if (!data) {
      throw new NotFoundException(`ID ${idS}에 해당하는 업적을 찾을 수 없습니다.`);
    }
    return data
  }

  async update(id: string, updateSubAchievementDto: UpdateSubAchievementDto) : Promise<[{message:string},SubAchievement]> {
    const idS = Number(id);
        if (!idS) {
          throw new BadRequestException('achievementId 값이 없거나 형식이 맞지 않습니다');
        }
        // id에 따른 데이터가 있는지 확인
        const isExists = await this.repository.findOne(idS)
        if(!isExists){
          throw new NotFoundException(`ID ${idS}에 해당하는 업적이 존재하지 않습니다.`);
          }
        if (!updateSubAchievementDto || Object.keys(updateSubAchievementDto).length === 0) {
          throw new BadRequestException('수정할 데이터를 입력하세요.');
        }
    
        await this.repository.update(idS, updateSubAchievementDto);
        // 수정여부를 확인하는 처리...

        const data = await this.repository.findOne(idS)
        if (!data) {
          throw new NotFoundException(`ID ${id}에 해당하는 업적을 확인인할 수 없습니다.`);
        }
        
        return [{message: '서브업적 수정 성공'},data]
      }
    

  // 소프트삭제
  async softDelete(id: string) {
    const idS = Number(id);
    if (!idS) {
      throw new BadRequestException('subAchievementId 값이 없거나 타이에 맞지 않습니다');
    }
    // id와 일치하는 값 있는지 확인
    const findId = await this.repository.findOne(idS)
    // softDelete
    await this.repository.softDelete(idS)
    // 수정 확인
    // id와 일치하는 값 있는지 확인
    const isdelete = await this.repository.findOne(idS)
    if (!isdelete?.deleted_at){
      throw new NotFoundException('서브업적 softDelete실패')
    }
    return {message:'삭제 성공'}
  }
}
