import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../aws.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: awsConfig.bucketName || '',
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => {
      const uniqueFileName = `${uuidv4()}-${file.originalname}`;

      const params = {
        Bucket: awsConfig.bucketName || '',
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      return this.s3
        .upload(params)
        .promise()
        .then((result) => result.Location);
    });

    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: awsConfig.bucketName || '',
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
      console.log(`File deleted successfully: ${key}`);
    } catch (error) {
      console.error(`Failed to delete file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
