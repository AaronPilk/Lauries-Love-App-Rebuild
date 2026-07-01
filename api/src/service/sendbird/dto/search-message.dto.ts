import { Type, Transform } from 'class-transformer';
import { 
  IsOptional, 
  IsString, 
  Max,
  Min,
  IsInt,
  IsNotEmpty
} from 'class-validator';

export class SearchMessageDto {
  @IsOptional()
  @IsString()
  channelUrl?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  query: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  @IsOptional()
  readonly limit?: number;

  @IsOptional()
  @IsString()
  next?: string;

}
