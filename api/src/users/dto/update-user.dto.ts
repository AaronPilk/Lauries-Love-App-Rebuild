import { IsArray, IsDate, IsEmail, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoLocationDto } from './createUser.dto';
import { UserConfig } from '@app/database/entities/user.entity';

export class UpdateObjectDto {
  @IsOptional()
  @IsUUID()
  id: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsUUID()
  id: string;
  @IsOptional()
  @IsUUID()
  cognitoId?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  displayName?: string;
  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @IsOptional()
  dob?: Date;
  @IsOptional()
  @IsString()
  addressLine1?: string;
  @IsOptional()
  @IsString()
  addressLine2?: string;
  @IsOptional()
  @IsString()
  city?: string;
  @IsOptional()
  @IsString()
  state?: string;
  @IsOptional()
  @IsString()
  country?: string;
  @IsOptional()
  @IsString()
  zipCode?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosisTypes?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosisSubTypes?: string[];
  @IsOptional()
  @IsString()
  age?: string;
  @IsOptional()
  @IsString()
  gender?: string;
  @IsOptional()
  @IsString()
  diagnosisYear?: string;
  @IsOptional()
  @IsDate()
  diagnosisDate?: Date;
  @IsOptional()
  @IsString()
  timeline?: string;
  @IsOptional()
  @IsString()
  phoneNumberLocation?: string;
  @IsOptional()
  @IsString()
  profilePicture?: string | null;
  @IsOptional()
  config?: UserConfig;
  @IsOptional()
  @Type(() => GeoLocationDto)
  @ValidateNested({ each: true })
  geoLocation?: GeoLocationDto;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @ValidateNested({ each: true })
  designation?: UpdateObjectDto;
  @IsOptional()
  @ValidateNested({ each: true })
  role?: UpdateObjectDto;
}
