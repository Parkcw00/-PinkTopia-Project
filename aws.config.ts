import { config } from 'dotenv';
config(); // .env 파일 로드

export const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_BUCKET_NAME,
};
