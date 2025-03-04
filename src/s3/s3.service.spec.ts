import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../aws.config';

// Mock AWS SDK
jest.mock('aws-sdk');

describe('S3Service', () => {
  let service: S3Service;
  let s3: jest.Mocked<AWS.S3>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    s3 = new AWS.S3() as jest.Mocked<AWS.S3>;

    // Mock S3 methods
    const uploadRequestMock = {
      promise: jest.fn(),
    } as unknown as AWS.Request<AWS.S3.UploadPartOutput, AWS.AWSError>;

    const deleteObjectRequestMock = {
      promise: jest.fn(),
    } as unknown as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>;

    s3.upload = jest.fn().mockReturnValue(uploadRequestMock);
    s3.deleteObject = jest.fn().mockReturnValue(deleteObjectRequestMock);

    // Override the S3 instance in the service
    (service as any).s3 = s3;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the file location', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('test content'),
        mimetype: 'text/plain',
      } as Express.Multer.File;

      const uploadResponse = {
        Location: 'https://bucket.s3.amazonaws.com/test.txt',
      };
      (s3.upload as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue(uploadResponse),
      });

      const result = await service.uploadFile(mockFile);
      expect(result).toBe(uploadResponse.Location);
      expect(s3.upload).toHaveBeenCalled();
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple files and return their locations', async () => {
      const mockFiles = [
        {
          originalname: 'test1.txt',
          buffer: Buffer.from('test content 1'),
          mimetype: 'text/plain',
        } as Express.Multer.File,
        {
          originalname: 'test2.txt',
          buffer: Buffer.from('test content 2'),
          mimetype: 'text/plain',
        } as Express.Multer.File,
      ];

      const uploadResponses = [
        { Location: 'https://bucket.s3.amazonaws.com/test1.txt' },
        { Location: 'https://bucket.s3.amazonaws.com/test2.txt' },
      ];

      (s3.upload as jest.Mock)
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValue(uploadResponses[0]),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValue(uploadResponses[1]),
        });

      const result = await service.uploadFiles(mockFiles);
      expect(result).toEqual(uploadResponses.map((res) => res.Location));
      expect(s3.upload).toHaveBeenCalledTimes(mockFiles.length);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const key = 'test.txt';

      (s3.deleteObject as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue({}),
      });

      await service.deleteFile(key);
      expect(s3.deleteObject).toHaveBeenCalledWith({
        Bucket: awsConfig.bucketName,
        Key: key,
      });
    });

    it('should throw an error if deletion fails', async () => {
      const key = 'test.txt';
      const errorMessage = 'Deletion failed';
      (s3.deleteObject as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      await expect(service.deleteFile(key)).rejects.toThrow(
        `Failed to delete file: ${errorMessage}`,
      );
    });
  });
});
