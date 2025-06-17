import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateActorDto {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nationality?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
