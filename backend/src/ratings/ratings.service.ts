import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating, Movie } from '../entities';
import { CreateRatingDto, UpdateRatingDto } from './dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const movie = await this.movieRepository.findOne({
      where: { id: createRatingDto.movieId },
    });

    if (!movie) {
      throw new BadRequestException(
        `Movie with ID ${createRatingDto.movieId} not found`,
      );
    }

    const rating = this.ratingRepository.create(createRatingDto);
    return this.ratingRepository.save(rating);
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({
      relations: ['movie'],
    });
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['movie'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  async findByMovie(movieId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { movieId },
      relations: ['movie'],
    });
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);

    Object.assign(rating, updateRatingDto);

    return this.ratingRepository.save(rating);
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOne(id);
    await this.ratingRepository.remove(rating);
  }

  async getAverageRating(
    movieId: number,
  ): Promise<{ average: number; count: number } | null> {
    const ratings = await this.ratingRepository.find({
      where: { movieId },
    });

    if (ratings.length === 0) {
      return null;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    const average = sum / ratings.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: ratings.length,
    };
  }
}
