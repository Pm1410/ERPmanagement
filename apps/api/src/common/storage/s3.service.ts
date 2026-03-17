import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('AWS_ENDPOINT'); // set for local MinIO
    const forcePathStyle = config.get<string>('AWS_FORCE_PATH_STYLE') === 'true';

    if (!config.get('AWS_ACCESS_KEY_ID')) {
      this.logger.warn('S3: No credentials configured — uploads will fail');
    }

    this.client = new S3Client({
      region: config.get('AWS_REGION', 'ap-south-1'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY', ''),
      },
      ...(endpoint ? { endpoint, forcePathStyle } : {}),
    });
    this.bucket = config.get('S3_BUCKET_NAME', 'school-erp-uploads');
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimeType: string,
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(originalName);
    const key = `${folder}/${uuidv4()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    this.logger.log(`Uploaded ${key}`);
    return { key, url: await this.getSignedUrl(key) };
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    const ttl = expiresIn ?? this.config.get<number>('S3_SIGNED_URL_EXPIRES', 3600);
    let url = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: ttl },
    );

    // In dev with MinIO, replace internal Docker hostname with public URL
    const publicUrl = process.env.AWS_PUBLIC_URL || 'http://localhost:9000';
    if (url.includes('http://minio:9000')) {
      url = url.replace('http://minio:9000', publicUrl);
    }

    return url;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Deleted ${key}`);
  }
}
