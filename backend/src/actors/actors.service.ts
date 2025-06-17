import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Actor } from '../entities';
import { CreateActorDto, UpdateActorDto } from './dto';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private actorRepository: Repository<Actor>,
  ) {}

  async create(createActorDto: CreateActorDto): Promise<Actor> {
    const actor = this.actorRepository.create(createActorDto);

    if (createActorDto.dateOfBirth) {
      actor.dateOfBirth = new Date(createActorDto.dateOfBirth);
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
    const actor = await this.findOne(id);

    Object.assign(actor, updateActorDto);

    if (updateActorDto.dateOfBirth) {
      actor.dateOfBirth = new Date(updateActorDto.dateOfBirth);
    }

    return this.actorRepository.save(actor);
  }

  async remove(id: number): Promise<void> {
    const actor = await this.findOne(id);
    await this.actorRepository.remove(actor);
  }

  async search(query: string): Promise<Actor[]> {
    return this.actorRepository
      .createQueryBuilder('actor')
      .leftJoinAndSelect('actor.movies', 'movies')
      .where('LOWER(actor.firstName) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(actor.lastName) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(actor.nationality) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(actor.biography) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .getMany();
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
