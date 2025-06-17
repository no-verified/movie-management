import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TMDBService } from './tmdb.service';
import { Movie, Actor, Rating } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Actor, Rating])],
  controllers: [SeedingController],
  providers: [SeedingService, TMDBService],
  exports: [SeedingService],
})
export class SeedingModule {}