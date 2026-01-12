/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profession?: string;
}
