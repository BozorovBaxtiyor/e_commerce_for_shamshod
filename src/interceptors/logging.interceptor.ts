import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Request log
    this.logger.log(
      `📥 ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Request body, query, params log (agar mavjud bo'lsa)
    if (Object.keys(body).length > 0) {
      this.logger.debug(`   Body: ${JSON.stringify(body)}`);
    }
    if (Object.keys(query).length > 0) {
      this.logger.debug(`   Query: ${JSON.stringify(query)}`);
    }
    if (Object.keys(params).length > 0) {
      this.logger.debug(`   Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode;

          // Status code rangiga qarab emoji
          let statusEmoji = '✅';
          if (statusCode >= 400 && statusCode < 500) {
            statusEmoji = '⚠️';
          } else if (statusCode >= 500) {
            statusEmoji = '❌';
          }

          this.logger.log(
            `${statusEmoji} ${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms`,
          );

          // Agar response juda sekin bo'lsa, warning berish
          if (responseTime > 1000) {
            this.logger.warn(
              `🐌 Slow response detected: ${method} ${originalUrl} took ${responseTime}ms`,
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.logger.error(
            `❌ ${method} ${originalUrl} - Error: ${error.message} - ${responseTime}ms`,
          );
          this.logger.error(`   Stack: ${error.stack}`);
        },
      }),
    );
  }
}
