import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

export const S3Provider = {
  provide: 'S3',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new S3({
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY'),
      secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
    });
  },
};
