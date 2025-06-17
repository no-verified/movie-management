import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  runtime?: number;
  poster_path: string;
  vote_average: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  place_of_birth: string;
  profile_path: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

@Injectable()
export class TMDBService {
  private readonly logger = new Logger(TMDBService.name);
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private configService: ConfigService) {}

  private get apiKey(): string {
    const key = this.configService.get<string>('TMDB_API_KEY');
    if (!key) {
      throw new Error('TMDB_API_KEY is not configured');
    }
    return key;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZTUwNzNiMjEzMThkMDU3OWViZTg2OWVjNDBjZjRmNyIsIm5iZiI6MTc1MDE2NjgzNy4xODU5OTk5LCJzdWIiOiI2ODUxNmQzNTA3NjAzYjBjMTQ1ZWE0MDciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.V8eBjuKs5QrsYaWR17Q_5WYbQOaqqQInaqvv-ZWtiWk`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `TMDB API response: ${response.status} ${response.statusText}`,
        );
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch from TMDB: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw error;
    }
  }

  async getPopularMovies(page: number = 1): Promise<{ results: TMDBMovie[] }> {
    return this.makeRequest(`/movie/popular?page=${page}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<{ results: TMDBMovie[] }> {
    return this.makeRequest(`/movie/top_rated?page=${page}`);
  }

  async getMovieDetails(
    movieId: number,
  ): Promise<TMDBMovie & { runtime: number }> {
    return this.makeRequest(`/movie/${movieId}`);
  }

  async getMovieCast(movieId: number): Promise<{ cast: TMDBCast[] }> {
    return this.makeRequest(`/movie/${movieId}/credits`);
  }

  async getPersonDetails(personId: number): Promise<TMDBPerson> {
    return this.makeRequest(`/person/${personId}`);
  }

  getFullImageUrl(imagePath: string | null): string | null {
    return imagePath ? `${this.imageBaseUrl}${imagePath}` : null;
  }

  async getGenres(): Promise<{ genres: Array<{ id: number; name: string }> }> {
    return this.makeRequest('/genre/movie/list');
  }
}
