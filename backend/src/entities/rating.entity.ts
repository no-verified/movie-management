import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  score: number; // 0.0 to 10.0

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reviewerName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string; // e.g., 'IMDb', 'Rotten Tomatoes', 'User'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, (movie) => movie.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;
}
