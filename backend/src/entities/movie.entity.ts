import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Actor } from './actor.entity';
import { Rating } from './rating.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre: string;

  @Column({ type: 'int', nullable: true })
  releaseYear: number;

  @Column({ type: 'int', nullable: true })
  duration: number; // in minutes

  @Column({ type: 'varchar', length: 500, nullable: true })
  posterUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Actor, (actor) => actor.movies)
  @JoinTable({
    name: 'movie_actors',
    joinColumn: { name: 'movieId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'actorId', referencedColumnName: 'id' },
  })
  actors: Actor[];

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];
}
