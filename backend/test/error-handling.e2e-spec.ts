import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  clearDatabase,
  API_KEY,
  expectErrorResponse,
} from './shared/test-setup';
import { Movie } from 'src/entities/movie.entity';

describe('Error Handling (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);
  });

  describe('Global Exception Filter', () => {
    it('should return consistent error format for validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({}) // Empty body should trigger validation errors
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(body.path).toBe('/movies');
      expect(body.method).toBe('POST');
      expect(Array.isArray(body.message)).toBe(true);
    });

    it('should return consistent error format for unauthorized requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .send({ title: 'Test Movie' })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
      expect(body.path).toBe('/movies');
      expect(body.method).toBe('POST');
    });

    it('should return consistent error format for not found errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/99999')
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
      expect(body.path).toBe('/movies/99999');
      expect(body.method).toBe('GET');
    });

    it('should return consistent error format for forbidden properties', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Test Movie',
          releaseYear: 2023,
          duration: 120,
          forbiddenProperty: 'should not exist',
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(
        body,
        400,
        'property forbiddenProperty should not exist',
      );
      expect(body.path).toBe('/movies');
      expect(body.method).toBe('POST');
    });

    it('should return consistent error format for invalid data types', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 123, // Should be string
          releaseYear: 'not-a-number', // Should be number
          duration: 'also-not-a-number', // Should be number
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(body.path).toBe('/movies');
      expect(body.method).toBe('POST');
      expect(Array.isArray(body.message)).toBe(true);
    });
  });

  describe('Authentication Errors', () => {
    it('should handle missing Authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'Test Movie',
          releaseYear: 2023,
          duration: 120,
        })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should handle invalid Authorization format', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', 'InvalidFormat')
        .send({
          title: 'Test Movie',
          releaseYear: 2023,
          duration: 120,
        })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should handle invalid API key in Authorization header', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', 'Bearer invalid-key')
        .send({
          title: 'Test Movie',
          releaseYear: 2023,
          duration: 120,
        })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should handle missing x-api-key header', async () => {
      const response = await request(app.getHttpServer())
        .post('/actors')
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
        })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should handle invalid x-api-key header', async () => {
      const response = await request(app.getHttpServer())
        .post('/actors')
        .set('x-api-key', 'invalid-key')
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
        })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });
  });

  describe('Validation Errors', () => {
    it('should handle multiple validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: '', // Too short
          releaseYear: 1500, // Too early
          duration: -5, // Negative
          posterUrl: 'not-a-url', // Invalid URL
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.length).toBeGreaterThan(1);
    });

    it('should handle validation errors for actors', async () => {
      const response = await request(app.getHttpServer())
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'a'.repeat(101), // Too long
          lastName: '', // Empty
          dateOfBirth: 'invalid-date', // Invalid format
          photoUrl: 'not-a-url', // Invalid URL
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.length).toBeGreaterThan(1);
    });

    it('should handle validation errors for ratings', async () => {
      // First create a movie
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Test Movie',
          releaseYear: 2023,
          duration: 120,
        });

      const movieBody = movieResponse.body as Movie;

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 15.5, // Above max and too many decimals
          reviewerName: 'a'.repeat(101), // Too long
          source: 'b'.repeat(51), // Too long
          movieId: movieBody.id,
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.length).toBeGreaterThan(1);
    });
  });

  describe('Not Found Errors', () => {
    it('should handle non-existent movie ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/99999')
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should handle non-existent actor ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/actors/99999')
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should handle non-existent rating ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/ratings/99999')
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should handle update of non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/movies/99999')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should handle delete of non-existent actor', async () => {
      const response = await request(app.getHttpServer())
        .delete('/actors/99999')
        .set('x-api-key', API_KEY)
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });
  });

  describe('Bad Request Errors', () => {
    it('should handle invalid ID format in URL parameters', async () => {
      await request(app.getHttpServer()).get('/movies/invalid-id').expect(400);

      await request(app.getHttpServer())
        .get('/actors/not-a-number')
        .expect(400);

      await request(app.getHttpServer()).get('/ratings/abc123').expect(400);
    });

    it('should handle rating for non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 8.5,
          movieId: 99999, // Non-existent movie
        })
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
    });

    it('should handle movie creation with non-existent actor IDs', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie with fake actors',
          releaseYear: 2023,
          duration: 120,
          actorIds: [99999, 99998], // Non-existent actors
        })
        .expect(201); // This should still succeed but with empty actors array

      const body = response.body as Movie;

      expect(body.actors).toEqual([]);
    });
  });

  describe('Method Not Allowed', () => {
    it('should handle unsupported HTTP methods', async () => {
      // PUT is not supported, only PATCH
      await request(app.getHttpServer())
        .put('/movies/1')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ title: 'Updated Title' })
        .expect(404); // NestJS returns 404 for undefined routes
    });
  });

  describe('Content Type Errors', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      // This is handled by Express before reaching our application
      expect(response.status).toBe(400);
    });
  });

  describe('Route Not Found', () => {
    it('should handle non-existent routes', async () => {
      await request(app.getHttpServer()).get('/non-existent-route').expect(404);
    });

    it('should handle root route', async () => {
      await request(app.getHttpServer()).get('/').expect(404); // No root controller defined
    });
  });
});
