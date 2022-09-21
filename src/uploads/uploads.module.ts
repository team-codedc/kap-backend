import { Module } from '@nestjs/common';
import { S3Provider } from 'src/libs/providers/s3';
import { UploadsService } from './uploads.service';
@Module({
  providers: [UploadsService, S3Provider],
  exports: [UploadsService],
})
export class UploadsModule {}
