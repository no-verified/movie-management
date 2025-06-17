import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Movie, Actor } from '../entities';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Actor)
    private actorRepository: Repository<Actor>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { actorIds, ...movieData } = createMovieDto;

    const movie = this.movieRepository.create(movieData);

    if (actorIds && actorIds.length > 0) {
      const actors = await this.actorRepository.findBy({
        id: In(actorIds),
      });
      movie.actors = actors;
    }

    return this.movieRepository.save(movie);
  }

  async findAll(page = 1, limit = 20): Promise<PaginatedResult<Movie>> {
    const skip = (page - 1) * limit;

    const [movies, total] = await this.movieRepository.findAndCount({
      relations: ['actors', 'ratings'],
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      items: movies,
      total,
      hasMore: skip + movies.length < total,
    };
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['actors', 'ratings'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const { actorIds, ...movieData } = updateMovieDto;

    const movie = await this.findOne(id);

    Object.assign(movie, movieData);

    if (actorIds !== undefined) {
      if (actorIds.length > 0) {
        const actors = await this.actorRepository.findBy({
          id: In(actorIds),
        });
        movie.actors = actors;
      } else {
        movie.actors = [];
      }
    }

    return this.movieRepository.save(movie);
  }

  async remove(id: number): Promise<void> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
  }

  async search(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<Movie>> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.actors', 'actors')
      .leftJoinAndSelect('movie.ratings', 'ratings')
      .where(
        'LOWER(movie.title) LIKE LOWER(:query) OR LOWER(movie.genre) LIKE LOWER(:query) OR LOWER(movie.description) LIKE LOWER(:query)',
        { query: `%${query}%` },
      )
      .orderBy('movie.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [movies, total] = await queryBuilder.getManyAndCount();

    return {
      items: movies,
      total,
      hasMore: skip + movies.length < total,
    };
  }

  async findByActor(actorId: number): Promise<Movie[]> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.actors', 'actor')
      .leftJoinAndSelect('movie.ratings', 'ratings')
      .where('actor.id = :actorId', { actorId })
      .getMany();
  }

  async findRecent(limit = 6): Promise<Movie[]> {
    const movieIds: { movie_id: number }[] = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin('movie.actors', 'actors')
      .leftJoin('movie.ratings', 'ratings')
      .where('movie.posterUrl IS NOT NULL AND movie.posterUrl != :empty', {
        empty: '',
      })
      .andWhere('movie.title IS NOT NULL')
      .andWhere('movie.description IS NOT NULL')
      .andWhere('movie.genre IS NOT NULL')
      .andWhere('movie.releaseYear IS NOT NULL')
      .groupBy('movie.id')
      .having('COUNT(DISTINCT actors.id) > 0')
      .orderBy('COALESCE(AVG(ratings.score), 0)', 'DESC')
      .addOrderBy('movie.releaseYear', 'DESC')
      .take(limit)
      .select('movie.id')
      .getRawMany();

    if (movieIds.length === 0) return [];

    return this.movieRepository.find({
      where: { id: In(movieIds.map((m) => m.movie_id)) },
      relations: ['actors', 'ratings'],
      order: { releaseYear: 'DESC' },
      take: limit,
    });
  }
}
