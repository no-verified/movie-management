import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Actor, Movie } from '../entities';
import { CreateActorDto, UpdateActorDto } from './dto';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private actorRepository: Repository<Actor>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async create(createActorDto: CreateActorDto): Promise<Actor> {
    const { movieIds, ...actorData } = createActorDto;

    const actor = this.actorRepository.create(actorData);

    if (actorData.dateOfBirth) {
      actor.dateOfBirth = new Date(actorData.dateOfBirth);
    }

    if (movieIds && movieIds.length > 0) {
      const movies = await this.movieRepository.findBy({
        id: In(movieIds),
      });
      actor.movies = movies;
    }

    return this.actorRepository.save(actor);
  }

  async findAll(): Promise<Actor[]> {
    return this.actorRepository.find({
      relations: ['movies'],
    });
  }

  async findOne(id: number): Promise<Actor> {
    const actor = await this.actorRepository.findOne({
      where: { id },
      relations: ['movies'],
    });

    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }

    return actor;
  }

  async update(id: number, updateActorDto: UpdateActorDto): Promise<Actor> {
    const { movieIds, ...actorData } = updateActorDto;

    const actor = await this.findOne(id);

    Object.assign(actor, actorData);

    if (actorData.dateOfBirth) {
      actor.dateOfBirth = new Date(actorData.dateOfBirth);
    }

    if (movieIds !== undefined) {
      if (movieIds.length > 0) {
        const movies = await this.movieRepository.findBy({
          id: In(movieIds),
        });
        actor.movies = movies;
      } else {
        actor.movies = [];
      }
    }

    return this.actorRepository.save(actor);
  }

  async remove(id: number): Promise<void> {
    const actor = await this.findOne(id);
    await this.actorRepository.remove(actor);
  }

  async search(query: string): Promise<Actor[]> {
    // Découper la requête en mots, ignorer les espaces multiples
    const words = query.trim().split(/\s+/).filter(Boolean);
    let qb = this.actorRepository
      .createQueryBuilder('actor')
      .leftJoinAndSelect('actor.movies', 'movies');

    // Recherche sur chaque mot dans prénom, nom, et nom complet
    words.forEach((word, idx) => {
      const param = `word${idx}`;
      if (idx === 0) {
        qb = qb.where(
          `LOWER(actor.firstName) LIKE LOWER(:${param}) OR LOWER(actor.lastName) LIKE LOWER(:${param}) OR LOWER(CONCAT(actor.firstName, ' ', actor.lastName)) LIKE LOWER(:${param})`,
          { [param]: `%${word}%` },
        );
      } else {
        qb = qb.andWhere(
          `(
            LOWER(actor.firstName) LIKE LOWER(:${param}) OR
            LOWER(actor.lastName) LIKE LOWER(:${param}) OR
            LOWER(CONCAT(actor.firstName, ' ', actor.lastName)) LIKE LOWER(:${param})
          )`,
          { [param]: `%${word}%` },
        );
      }
    });

    return qb.getMany();
  }

  async findByMovie(movieId: number): Promise<Actor[]> {
    return this.actorRepository
      .createQueryBuilder('actor')
      .leftJoinAndSelect('actor.movies', 'movie')
      .where('movie.id = :movieId', { movieId })
      .getMany();
  }

  async findRecent(limit = 6): Promise<Actor[]> {
    const actorIds: { actor_id: number }[] = await this.actorRepository
      .createQueryBuilder('actor')
      .leftJoin('actor.movies', 'movies')
      .leftJoin('movies.ratings', 'ratings')
      .where('actor.photoUrl IS NOT NULL AND actor.photoUrl != :empty', {
        empty: '',
      })
      .andWhere('actor.firstName IS NOT NULL')
      .andWhere('actor.lastName IS NOT NULL')
      .andWhere('actor.biography IS NOT NULL')
      .andWhere('actor.nationality IS NOT NULL')
      .groupBy('actor.id')
      .having('COUNT(DISTINCT movies.id) > 0')
      .orderBy('COALESCE(AVG(ratings.score), 0)', 'DESC')
      .addOrderBy('actor.createdAt', 'DESC')
      .take(limit)
      .select('actor.id')
      .getRawMany();

    if (actorIds.length === 0) return [];

    return this.actorRepository.find({
      where: { id: In(actorIds.map((a) => a.actor_id)) },
      relations: ['movies'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
