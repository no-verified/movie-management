import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      where: { id: createRatingDto.movieId }
    });
    
    if (!movie) {
      throw new BadRequestException(`Movie with ID ${createRatingDto.movieId} not found`);
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

  async getAverageRating(movieId: number): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'average')
      .where('rating.movieId = :movieId', { movieId })
      .getRawOne();
    
    return result.average ? parseFloat(result.average) : 0;
  }
}