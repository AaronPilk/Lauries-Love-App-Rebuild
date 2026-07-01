import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_POST_BUCKET');
    this.bucketUrl = this.configService.get('AWS_S3_BUCKET_URL');
  }

  /**
   * @param key - The key of the object to upload
   * @param contentType - The content type of the object
   * @param expiresIn - The expiration time of the signed URL in seconds
   * @returns The signed URL and the S3 URL
   */
  async getSignedUrl(
    key: string,
    contentType?: string,
    expiresIn?: number,
  ): Promise<{ s3Url: string; uploadUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ...(contentType ? { ContentType: contentType } : {}),
    });

    const uploadUrl = await getSignedUrl(this.s3Client as any, command, { ...expiresIn !== undefined ? { expiresIn } : null });

    return {
      s3Url: `${process.env.AWS_S3_BUCKET_URL}/${key}`,
      uploadUrl,
    };
  }

  /**
   * @param key - The key of the object to access
   * @param expiresIn - The expiration time of the signed URL in seconds
   * @returns The signed URL
   */
  async getAccessUrl(key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      ...expiresIn !== undefined ? { expiresIn } : null,
    });
  }

  async putObjectToS3(key: string, file: Buffer, contentType: string): Promise<{ s3Url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return {
      s3Url: await this.getAccessUrl(key),
      key,
    };
  }

  async getObjectFromS3(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return Buffer.from(await response.Body.transformToByteArray());
  }
}
