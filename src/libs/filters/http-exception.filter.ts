import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    return response.status(status).json({
      status: 'FAILED',
      message: typeof message === 'string' ? message : message['message'],
      result: null,
    });
  }
}
