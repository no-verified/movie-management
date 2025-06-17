import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateRatingDto {
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.0)
  @Max(10.0)
  score: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  reviewerName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  source?: string;

  @IsNumber()
  movieId: number;
}
