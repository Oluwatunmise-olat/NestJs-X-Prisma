import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthRegisterDto {
  @IsEmail()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;
}
