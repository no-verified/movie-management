import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  clearDatabase,
  expectErrorResponse,
  getHttpServer,
  createTestUser,
} from './shared/test-setup';
import { Movie } from 'src/entities/movie.entity';
import { Actor } from 'src/entities/actor.entity';
import { PaginatedResult } from 'src/common/types/paginated-result.type';

describe('Movies API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);
    const { token } = await createTestUser(app);
    authToken = token;
  });

  describe('POST /movies', () => {
    it('should create a movie with valid data and API key', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        description: 'A test movie description',
        genre: 'Action',
        releaseYear: 2023,
        duration: 120,
        posterUrl: 'https://example.com/poster.jpg',
        actorIds: [],
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMovieDto)
        .expect(201);

      const body = response.body as Movie;

      expect(body).toHaveProperty('id');
      expect(body.title).toBe(createMovieDto.title);
      expect(body.description).toBe(createMovieDto.description);
      expect(body.genre).toBe(createMovieDto.genre);
      expect(body.releaseYear).toBe(createMovieDto.releaseYear);
      expect(body.duration).toBe(createMovieDto.duration);
      expect(body.posterUrl).toBe(createMovieDto.posterUrl);
    });

    it('should create a movie with actors', async () => {
      // First create an actor
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1980-01-01',
        });

      const createMovieDto = {
        title: 'Movie with Actor',
        releaseYear: 2023,
        duration: 120,
        actorIds: [(actorResponse.body as Actor).id],
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMovieDto)
        .expect(201);

      const body = response.body as Movie;

      expect(body).toHaveProperty('id');
      expect(body.title).toBe(createMovieDto.title);
      expect(body.actors).toHaveLength(1);
      expect(body.actors[0].id).toBe((actorResponse.body as Actor).id);
    });

    it('should reject movie creation without API key', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        releaseYear: 2023,
        duration: 120,
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .send(createMovieDto)
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Unauthorized');
    });

    it('should validate required fields', async () => {
      const invalidMovieDto = {
        description: 'Missing title',
        // title is required
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMovieDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.some((msg: string) => msg.includes('title'))).toBe(
        true,
      );
    });

    it('should validate field constraints', async () => {
      const invalidMovieDto = {
        title: '', // Empty title
        releaseYear: 1799, // Too early
        duration: -1, // Negative duration
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMovieDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toContain(
        'title must be longer than or equal to 1 characters',
      );
      expect(body.message).toContain('releaseYear must not be less than 1800');
      expect(body.message).toContain('duration must not be less than 1');
    });

    it('should reject extra properties', async () => {
      const invalidMovieDto = {
        title: 'Test Movie',
        releaseYear: 2023,
        duration: 120,
        extraProperty: 'should not be allowed',
      };

      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMovieDto)
        .expect(400);

      expectErrorResponse(
        response.body,
        400,
        'property extraProperty should not exist',
      );
    });
  });

  describe('GET /movies', () => {
    beforeEach(async () => {
      // Create test data
      await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Movie 1',
          description: 'First test movie',
          genre: 'Action',
          releaseYear: 2023,
          duration: 120,
        });

      await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Movie 2',
          description: 'Second test movie',
          genre: 'Comedy',
          releaseYear: 2024,
          duration: 90,
        });
    });

    it('should return paginated movies', async () => {
      const response = await request(getHttpServer(app))
        .get('/movies')
        .expect(200);

      const body = response.body as PaginatedResult<Movie>;

      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBe(2);
      expect(body.total).toBe(2);
      expect(body.hasMore).toBe(false);
    });

    it('should support pagination parameters', async () => {
      const response = await request(getHttpServer(app))
        .get('/movies?page=1&limit=1')
        .expect(200);

      const body = response.body as PaginatedResult<Movie>;

      expect(body.items.length).toBe(1);
      expect(body.total).toBe(2);
      expect(body.hasMore).toBe(true);
    });

    it('should support search parameter', async () => {
      const response = await request(getHttpServer(app))
        .get('/movies?search=Comedy')
        .expect(200);

      const body = response.body as PaginatedResult<Movie>;

      expect(body.items.length).toBe(1);
      expect(body.items[0].genre).toBe('Comedy');
    });
  });

  describe('GET /movies/:id', () => {
    let movieId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Movie for Get',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (response.body as Movie).id;
    });

    it('should return a movie by id', async () => {
      const response = await request(getHttpServer(app))
        .get(`/movies/${movieId}`)
        .expect(200);

      const body = response.body as Movie;

      expect(body).toHaveProperty('id', movieId);
      expect(body).toHaveProperty('title', 'Test Movie for Get');
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(getHttpServer(app))
        .get('/movies/99999')
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(getHttpServer(app)).get('/movies/invalid-id').expect(400);
    });
  });

  describe('GET /movies/:id/actors', () => {
    let movieId: number;
    let actorId: number;

    beforeEach(async () => {
      // Create actor
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
        });
      actorId = (actorResponse.body as Actor).id;

      // Create movie with actor
      const movieResponse = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Movie with Actor',
          releaseYear: 2023,
          duration: 120,
          actorIds: [actorId],
        });
      movieId = (movieResponse.body as Movie).id;
    });

    it('should return actors for a movie', async () => {
      const response = await request(getHttpServer(app))
        .get(`/movies/${movieId}/actors`)
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0]).toHaveProperty('id', actorId);
      expect(body[0]).toHaveProperty('firstName', 'Test');
      expect(body[0]).toHaveProperty('lastName', 'Actor');
    });
  });

  describe('PATCH /movies/:id', () => {
    let movieId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (response.body as Movie).id;
    });

    it('should update a movie', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const response = await request(getHttpServer(app))
        .patch(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as Movie;

      expect(body.title).toBe(updateData.title);
      expect(body.description).toBe(updateData.description);
      expect(body.releaseYear).toBe(2023); // Should remain unchanged
    });

    it('should require API key for update', async () => {
      const response = await request(getHttpServer(app))
        .patch(`/movies/${movieId}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Unauthorized');
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(getHttpServer(app))
        .patch('/movies/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });
  });

  describe('DELETE /movies/:id', () => {
    let movieId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Movie to Delete',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (response.body as Movie).id;
    });

    it('should delete a movie', async () => {
      await request(getHttpServer(app))
        .delete(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify movie is deleted
      await request(getHttpServer(app)).get(`/movies/${movieId}`).expect(404);
    });

    it('should require API key for deletion', async () => {
      const response = await request(getHttpServer(app))
        .delete(`/movies/${movieId}`)
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Unauthorized');
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(getHttpServer(app))
        .delete('/movies/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });
  });

  describe('GET /movies/recent', () => {
    it('should return recent movies', async () => {
      // Create a movie with actors (required for recent movies)
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
        });

      await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Recent Movie',
          description: 'A recent movie',
          genre: 'Action',
          releaseYear: 2024,
          duration: 120,
          posterUrl: 'https://example.com/poster.jpg',
          actorIds: [(actorResponse.body as Actor).id],
        });

      const response = await request(getHttpServer(app))
        .get('/movies/recent')
        .expect(200);

      const body = response.body as Movie[];

      expect(Array.isArray(body)).toBe(true);
      // Recent movies require actors and all fields populated
    });
  });
});
