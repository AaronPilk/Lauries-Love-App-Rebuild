import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Response } from 'express';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    Logger.error(exception);
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responsePayload = exception.getResponse();
      response.status(status).json({
        message: responsePayload['message'],
        error: responsePayload['error'],
        statusCode: status,
      });
    } else {
      // There is no more error handlers so it should have status code 500
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const statusMessage = HttpStatus[status]
        .toLowerCase()
        .replace('_', ' ');
      const errorMessage =
        statusMessage.charAt(0).toUpperCase() + statusMessage.slice(1);
      response.status(status).json({
        message: errorMessage,
        statusCode: status,
      });
    }
  }
}
