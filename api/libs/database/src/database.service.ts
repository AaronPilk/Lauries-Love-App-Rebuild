import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
}
