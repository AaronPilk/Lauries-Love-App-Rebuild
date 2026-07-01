import { Injectable, Logger } from '@nestjs/common';

// const BATCH_SIZE = 100;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
}
