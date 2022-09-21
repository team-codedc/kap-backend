import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private ALLOW_FILE_MIME = ['image/jpeg', 'image/png'];

  constructor(
    @Inject('S3') private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {}

  public upload(file: Express.Multer.File) {
    console.log(file);
    // if (!this.ALLOW_FILE_MIME.includes(file.mimetype)) {
    //   throw new BadRequestException(
    //     '지원하지 않는 이미지 형식이에요. jpeg, png 파일 형식을 사용해주세요',
    //   );
    // }
    const urlKey = uuidV4();
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Body: file.buffer,
      ContentType: 'image/png' || 'image/jpeg',
      ACL: 'public-read',
      Key: file.fieldname + '/' + urlKey,
    };
    this.s3.putObject(params).promise().then();
    const AWS_S3_ADDRESS_URL = this.configService.get<string>('AWS_S3_ADDRESS_URL');
    return {
      url: AWS_S3_ADDRESS_URL + `${params.Key}`,
    };
  }
}
