import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { MoviesService } from '../../src/movies/movies.service';
import { ActorsService } from '../../src/actors/actors.service';
import { RatingsService } from '../../src/ratings/ratings.service';
import { MoviesController } from '../../src/movies/movies.controller';
import { ActorsController } from '../../src/actors/actors.controller';
import { RatingsController } from '../../src/ratings/ratings.controller';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { Movie, Actor, Rating, User } from '../../src/entities';
import { ApiKeyGuard } from '../../src/auth/guards/api-key.guard';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { AuthService } from '../../src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';

export const API_KEY = 'your_super_secret_api_key_here';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({ API_SECRET: API_KEY })],
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Movie, Actor, Rating, User],
        synchronize: true,
        dropSchema: false,
        logging: false,
      }),
      TypeOrmModule.forFeature([Movie, Actor, Rating, User]),
      PassportModule,
      JwtModule.register({
        secret: 'test-secret',
        signOptions: { expiresIn: '1d' },
      }),
    ],
    controllers: [MoviesController, ActorsController, RatingsController],
    providers: [
      MoviesService,
      ActorsService,
      RatingsService,
      ApiKeyGuard,
      JwtAuthGuard,
      AuthService,
      JwtStrategy,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.init();
  return app;
}

export async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);

  // Use repository-based cleanup for better reliability
  const ratingRepo = dataSource.getRepository(Rating);
  const movieRepo = dataSource.getRepository(Movie);
  const actorRepo = dataSource.getRepository(Actor);
  const userRepo = dataSource.getRepository(User);

  try {
    // Clear in proper order to respect foreign key constraints
    await ratingRepo.clear();
    await movieRepo.createQueryBuilder().delete().execute();
    await actorRepo.clear();
    await userRepo.clear();

    // Also clear the junction table
    try {
      await dataSource.query('DELETE FROM movie_actors_actor');
    } catch {
      // Junction table might not exist, that's OK
    }

    // Reset auto-increment counters
    try {
      await dataSource.query(
        'DELETE FROM sqlite_sequence WHERE name IN ("rating", "movie", "actor", "users")',
      );
    } catch {
      // sqlite_sequence might not exist, that's OK
    }
  } catch (error) {
    // If cleanup fails, try to recreate the schema
    console.error('Database cleanup failed:', error);
    await dataSource.synchronize();
  }
}

export function expectErrorResponse(
  body: any,
  statusCode: number,
  messageContains?: string,
): void {
  expect(body).toHaveProperty('statusCode', statusCode);
  expect(body).toHaveProperty('timestamp');
  expect(body).toHaveProperty('path');
  expect(body).toHaveProperty('method');
  expect(body).toHaveProperty('error');
  expect(body).toHaveProperty('message');

  if (messageContains) {
    const message = (body as { message: string | string[] }).message;
    if (Array.isArray(message)) {
      expect(message.some((msg: string) => msg.includes(messageContains))).toBe(
        true,
      );
    } else {
      expect(message).toContain(messageContains);
    }
  }
}

export function getHttpServer(
  app: INestApplication,
): Parameters<typeof import('supertest')>[0] {
  return app.getHttpServer() as Parameters<typeof import('supertest')>[0];
}

export async function createTestUser(
  app: INestApplication,
): Promise<{ user: User; token: string }> {
  const authService = app.get(AuthService);
  const userRepo = app.get(DataSource).getRepository(User);

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  const result = await authService.register(testUser);
  const createdUser = await userRepo.findOne({
    where: { email: testUser.email },
  });

  return {
    user: createdUser!,
    token: result.access_token,
  };
}
