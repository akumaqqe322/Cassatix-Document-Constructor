import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Env } from '../config/env.schema';

export interface StorageFile {
  key: string;
  buffer: Buffer;
  contentType: string;
}

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService<Env>) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get('S3_ENDPOINT'),
      region: 'us-east-1', // Default for many S3-compatible storages
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY')!,
        secretAccessKey: this.configService.get('S3_SECRET_KEY')!,
      },
      forcePathStyle: true, // Required for Minio/LocalStack
    });
    this.bucket = this.configService.get('S3_BUCKET')!;
  }

  async upload(file: StorageFile): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
        Body: file.buffer,
        ContentType: file.contentType,
      }),
    );
    return file.key;
  }

  async getDownloadUrl(key: string, expiresId = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresId });
  }

  async delete(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
