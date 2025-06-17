import {
  Controller,
  Post,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { ApiKeyGuard } from '../auth/guards';

@Controller('seeding')
@UseGuards(ApiKeyGuard)
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post('movies')
  @HttpCode(201)
  async seedMovies(
    @Query('count', new ParseIntPipe({ optional: true })) count: number = 100,
  ) {
    try {
      await this.seedingService.seedDatabase(count);
      return {
        message: `Successfully seeded ${count} movies from TMDB API`,
        status: 'completed',
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('TMDB_API_KEY')) {
        return {
          message:
            'TMDB API key not configured. Please add TMDB_API_KEY to your environment variables.',
          status: 'error',
          instructions:
            'Get your API key from https://www.themoviedb.org/settings/api',
        };
      }
      throw error;
    }
  }

  @Delete('clear')
  @HttpCode(204)
  async clearDatabase(): Promise<void> {
    await this.seedingService.clearDatabase();
  }
}
