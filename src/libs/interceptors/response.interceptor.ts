import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  result: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();
    const allowPath: string[] = ['/api/health'];

    if (allowPath.includes(request.url)) return next.handle().pipe();

    return next.handle().pipe(
      map((result) => ({
        status: 'SUCCESS',
        message: '',
        result,
      })),
    );
  }
}
