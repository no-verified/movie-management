import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie, Actor, Rating } from '../entities';
import { TMDBService, TMDBMovie, TMDBCast } from './tmdb.service';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);
  private genreMap = new Map<number, string>();

  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Actor)
    private actorRepository: Repository<Actor>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    private tmdbService: TMDBService,
  ) {}

  async seedDatabase(numberOfMovies: number = 100): Promise<void> {
    this.logger.log(
      `Starting database seeding with ${numberOfMovies} movies...`,
    );

    try {
      // First, load genre mapping
      await this.loadGenres();

      // Seed movies in batches
      const batchSize = 20;
      const numberOfBatches = Math.ceil(numberOfMovies / batchSize);

      for (let batch = 1; batch <= numberOfBatches; batch++) {
        this.logger.log(`Processing batch ${batch}/${numberOfBatches}...`);

        const moviesData = await this.tmdbService.getPopularMovies(batch);
        const moviesToProcess = moviesData.results.slice(
          0,
          batch === numberOfBatches
            ? numberOfMovies % batchSize || batchSize
            : batchSize,
        );

        await this.processBatch(moviesToProcess);

        // Add delay to respect API rate limits
        await this.delay(1000);
      }

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async loadGenres(): Promise<void> {
    const genresData = await this.tmdbService.getGenres();
    genresData.genres.forEach((genre) => {
      this.genreMap.set(genre.id, genre.name);
    });
    this.logger.log(`Loaded ${this.genreMap.size} genres`);
  }

  private async processBatch(tmdbMovies: TMDBMovie[]): Promise<void> {
    for (const tmdbMovie of tmdbMovies) {
      try {
        // Check if movie already exists
        const existingMovie = await this.movieRepository.findOne({
          where: { title: tmdbMovie.title },
        });

        if (existingMovie) {
          this.logger.debug(
            `Movie "${tmdbMovie.title}" already exists, skipping`,
          );
          continue;
        }

        // Get detailed movie info
        const movieDetails = await this.tmdbService.getMovieDetails(
          tmdbMovie.id,
        );
        const castData = await this.tmdbService.getMovieCast(tmdbMovie.id);

        // Create movie
        const movie = await this.createMovie(movieDetails);

        // Process cast (limit to top 5 actors)
        const topCast = castData.cast.slice(0, 5);
        const actors = await this.processActors(topCast);

        // Associate actors with movie
        movie.actors = actors;
        await this.movieRepository.save(movie);

        // Create some ratings
        await this.createRatings(movie, tmdbMovie.vote_average);

        this.logger.debug(`Successfully processed movie: ${movie.title}`);

        // Small delay between movies
        await this.delay(200);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to process movie "${tmdbMovie.title}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }
  }

  private async createMovie(
    tmdbMovie: TMDBMovie & { runtime: number },
  ): Promise<Movie> {
    const genre =
      tmdbMovie.genre_ids?.length > 0
        ? this.genreMap.get(tmdbMovie.genre_ids[0])
        : 'Unknown';

    const movieData: Partial<Movie> = {
      title: tmdbMovie.title,
      description: tmdbMovie.overview || 'No description available',
      genre: genre || 'Unknown',
      releaseYear: tmdbMovie.release_date
        ? new Date(tmdbMovie.release_date).getFullYear()
        : undefined,
      duration: tmdbMovie.runtime || undefined,
      posterUrl:
        this.tmdbService.getFullImageUrl(tmdbMovie.poster_path) || undefined,
    };

    const movie = this.movieRepository.create(movieData);
    return await this.movieRepository.save(movie);
  }

  private async processActors(cast: TMDBCast[]): Promise<Actor[]> {
    const actors: Actor[] = [];

    for (const castMember of cast) {
      try {
        // Check if actor already exists
        let actor = await this.actorRepository.findOne({
          where: {
            firstName: castMember.name.split(' ')[0],
            lastName:
              castMember.name.split(' ').slice(1).join(' ') ||
              castMember.name.split(' ')[0],
          },
        });

        if (!actor) {
          // Get detailed person info
          const personDetails = await this.tmdbService.getPersonDetails(
            castMember.id,
          );

          const nameParts = castMember.name.split(' ');
          const actorData: Partial<Actor> = {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ') || nameParts[0],
            nationality:
              personDetails.place_of_birth?.split(', ').pop() || undefined,
            biography: personDetails.biography || undefined,
            photoUrl:
              this.tmdbService.getFullImageUrl(personDetails.profile_path) ||
              undefined,
          };

          if (personDetails.birthday) {
            actorData.dateOfBirth = new Date(personDetails.birthday);
          }

          actor = this.actorRepository.create(actorData);

          actor = await this.actorRepository.save(actor);
          this.logger.debug(`Created new actor: ${actor.fullName}`);
        }

        actors.push(actor);

        // Small delay between actor requests
        await this.delay(100);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to process actor "${castMember.name}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return actors;
  }

  private async createRatings(movie: Movie, tmdbRating: number): Promise<void> {
    // Create a few sample ratings based on TMDB rating
    const ratings = [
      {
        score: Math.round(tmdbRating * 10) / 10,
        review: 'Great movie with excellent performances!',
        reviewerName: 'TMDB Community',
        source: 'TMDB',
        movieId: movie.id,
      },
      {
        score: Math.round((tmdbRating + Math.random() - 0.5) * 10) / 10,
        review: 'Highly recommended for movie enthusiasts.',
        reviewerName: 'Film Critic',
        source: 'Professional Review',
        movieId: movie.id,
      },
    ];

    for (const ratingData of ratings) {
      // Ensure score is within valid range
      ratingData.score = Math.max(0, Math.min(10, ratingData.score));

      const rating = this.ratingRepository.create(ratingData);
      await this.ratingRepository.save(rating);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async clearDatabase(): Promise<void> {
    this.logger.log('Clearing database...');

    await this.ratingRepository.delete({});
    await this.movieRepository
      .createQueryBuilder()
      .delete()
      .from('movie_actors')
      .execute();
    await this.movieRepository.delete({});
    await this.actorRepository.delete({});

    this.logger.log('Database cleared successfully');
  }
}
