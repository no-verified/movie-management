import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsUrl,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  genre?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear() + 10)
  releaseYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsUrl()
  posterUrl?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  actorIds?: number[];
}
