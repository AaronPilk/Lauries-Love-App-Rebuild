import { IsArray, IsDate, IsEmail, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UserConfig } from "../../../libs/database/src/entities/user.entity";
import { Type } from 'class-transformer';

export class GeoLocationDto {
  @IsNumber()
  latitude: number;
  @IsNumber()
  longitude: number;
}
export class CreateUser {
  @IsUUID()
  cognitoId?: string;
  @IsEmail()
  email: string;
  @IsString()
  displayName: string;
  @IsString()
  firstName: string;
  @IsString()
  phoneNumber: string;




  
  @IsOptional()
  @IsString()
  lastName?: string;
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
  city: string;
  @IsOptional()
  @IsString()
  state?: string;
  @IsOptional()
  @IsString()
  country: string;
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
  age: string;
  @IsOptional()
  @IsString()
  gender: string;
  @IsOptional()
  @IsString()
  diagnosisYear: string;
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
  profilePicture?: string;

  @IsOptional()
  config?: UserConfig;
  @Type(() => GeoLocationDto)
  @ValidateNested({ each: true })
  geoLocation?: GeoLocationDto;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsUUID()
  designation?: string;
  @IsOptional()
  @IsUUID()
  role: string;
}