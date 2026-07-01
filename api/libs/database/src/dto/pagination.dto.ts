import { IsInt } from 'class-validator';
import { CoreOutput } from './output.dto';

export class PaginationOutput extends CoreOutput {
  totalPages?: number;

  totalResults?: number;
}

export class PaginationInput {
  @IsInt()
  limit?: number;

  @IsInt()
  offset: number;
}
