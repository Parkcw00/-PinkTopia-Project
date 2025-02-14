import { Injectable } from '@nestjs/common';
// @Injectable 데코레이터를 사용하여 NestJS의 서비스 클래스임을 명시
import * as AWS from 'aws-sdk';
// AWS SDK를 사용하여 S3와의 통신을 수행
import { awsConfig } from '../../aws.config';
// 프로젝트의 awsConfig 설정 파일을 불러와 AWS S3 버킷 정보를 가져옴
import { v4 as uuidv4 } from 'uuid';
// uuid 라이브러리를 사용하여 고유한 파일명을 생성

const s3 = new AWS.S3({
  accessKeyId: awsConfig.accessKeyId, // AWS 액세스 키
  secretAccessKey: awsConfig.secretAccessKey, // AWS 시크릿 키
  region: awsConfig.region, // AWS S3 리전 설정
});

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    // 파일명을 고유하게 만들기 위해 UUID를 추가
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;

    // S3 업로드 설정
    const params = {
      Bucket: awsConfig.bucketName, // 업로드할 S3 버킷 이름
      Key: uniqueFileName, // 업로드할 파일의 S3 내 경로 및 파일명
      Body: file.buffer, // 업로드할 파일의 데이터
      ContentType: file.mimetype, // MIME 타입 설정 (브라우저에서 파일 직접 보기 가능)
      // ACL: 'public-read', // 업로드된 파일을 공개적으로 접근 가능하게 설정
    };
    // S3에 파일 업로드
    const uploadResult = await s3
      .upload({
        ...params,
        Bucket: awsConfig.bucketName || '', // Ensure Bucket is never undefined
      })
      .promise();
    // S3 URL과 CloudFront URL 반환
    return {
      s3Url: uploadResult.Location, // 업로드된 S3의 파일 URL
    };
  }
}
