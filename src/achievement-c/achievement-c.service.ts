import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';
import { UpdateAchievementCDto } from './dto/update-achievement-c.dto';
import {AchievementCRepository} from './achievement-c.repository'

@Injectable()
export class AchievementCService {
  constructor(private readonly repository: AchievementCRepository,) {}
  
  async create(createAchievementCDto: CreateAchievementCDto) {
    return await this.repository.create(createAchievementCDto);
  }

  // 완료업적 하나 조회
  async findOne(id: string) {
    if(!id){
      throw new NotFoundException('achievementCId가 없습니다.');
    }
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementCId 값이 없거나 틀린 형식입니다');
    }
    // 타이틀 가져오기
    const titleC= await this.repository.findTitleC(idA);
    if (!titleC){
      throw new NotFoundException('완료되지 않는 업적 입니다.');
    }

    // 관련 서브업적 조회 []
    const findP= await this.repository.findP(idA);
    if(!findP || findP.length===0){
      throw new NotFoundException('관련된 서브업적이 없습니다.');
    }

    // 폼 수정
    const answerOne = {
      [titleC]: findP, // 🔥 키 값을 동적으로 설정
    };

  return answerOne;
  }



  // 타이틀만 조회
  async findAll() {
    return await this.repository.findAll()
  }





  async remove(id: string) {
    if(!id){
      throw new NotFoundException('achievementCId가 없습니다.');
    }
    const idA = Number(id);
    if (!idA) {
      throw new BadRequestException('achievementCId 값이 없거나 틀린 형식입니다');
    }
    const deleteResult = await this.repository.remove(idA);
    if((deleteResult?.affected ?? 0) <1 ){
      throw new NotFoundException('해당 업적을 찾을 수 없습니다.');    
    }
   return { message: '삭제 성공' }
  }


  







}
