import { PaginationInput, PaginationOutput } from '@app/database/dto';

export class ListPaymentsInput extends PaginationInput {}
export class ListPaymentsOutput extends PaginationOutput {
  items: object[];
}
