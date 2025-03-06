// import { Transactional } from 'typeorm-transactional-cls-hooked';

// @Transactional()
// async post(user_id: number, subId: number): Promise<AchievementP> {
//   if (!subId) {
//     throw new BadRequestException('subAchievementId 값이 없거나 형식이 맞지 않습니다');
//   }

//   const isSubId = await this.repository.findSub(subId);
//   if (!isSubId) {
//     throw new NotFoundException('해당 서브업적이 존재하지 않습니다.');
//   }

//   // 중복 검사
//   const alreadyP = await this.repository.findPByUserNSub(user_id, subId);
//   if (alreadyP) {
//     throw new BadRequestException('이미 달성한 서브업적 입니다.');
//   }

//   // 데이터 생성 및 저장
//   const dataP = {
//     user_id,
//     sub_achievement_id: subId,
//     achievement_id: isSubId?.achievement_id ?? null,
//     complete: true,
//   };

//   const createP = await this.repository.createP(dataP);
//   const save = await this.repository.save(createP);

//   if (!save) {
//     throw new BadRequestException('저장 실패했습니다.');
//   }

//   return save;
// }
