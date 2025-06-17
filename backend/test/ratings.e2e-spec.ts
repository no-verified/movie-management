import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  clearDatabase,
  API_KEY,
  expectErrorResponse,
} from './shared/test-setup';
import { Movie, Rating } from 'src/entities';

describe('Ratings API (e2e)', () => {
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

  describe('POST /ratings', () => {
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie for Rating',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;
    });

    it('should create a rating with all fields', async () => {
      const createRatingDto = {
        score: 8.5,
        review: 'Great movie!',
        reviewerName: 'Test Reviewer',
        source: 'Test Source',
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(createRatingDto)
        .expect(201);

      const body = response.body as Rating;

      expect(body).toHaveProperty('id');
      expect(body.score).toBe(createRatingDto.score);
      expect(body.review).toBe(createRatingDto.review);
      expect(body.reviewerName).toBe(createRatingDto.reviewerName);
      expect(body.source).toBe(createRatingDto.source);
      expect(body.movieId).toBe(movieId);
    });

    it('should create a rating with minimal required fields', async () => {
      const createRatingDto = {
        score: 7.0,
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(createRatingDto)
        .expect(201);

      const body = response.body as Rating;

      expect(body).toHaveProperty('id');
      expect(body.score).toBe(createRatingDto.score);
      expect(body.movieId).toBe(movieId);
      expect(body.review).toBeNull();
      expect(body.reviewerName).toBeNull();
      expect(body.source).toBeNull();
    });

    it('should require API key', async () => {
      const createRatingDto = {
        score: 8.5,
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .send(createRatingDto)
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should validate required fields', async () => {
      const invalidRatingDto = {
        // Missing score and movieId
        review: 'Missing required fields',
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message.some((msg: string) => msg.includes('score'))).toBe(
        true,
      );
      expect(body.message.some((msg: string) => msg.includes('movieId'))).toBe(
        true,
      );
    });

    it('should validate score range minimum', async () => {
      const invalidRatingDto = {
        score: -1.0, // Below minimum
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400, 'score must not be less than 0');
    });

    it('should validate score range maximum', async () => {
      const invalidRatingDto = {
        score: 11.0, // Above maximum
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400, 'score must not be greater than 10');
    });

    it('should validate score decimal places', async () => {
      const invalidRatingDto = {
        score: 8.55, // More than 1 decimal place
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
    });

    it('should accept valid score formats', async () => {
      // Test whole number
      const response1 = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 8, movieId: movieId })
        .expect(201);

      const body = response1.body as Rating;
      expect(body.score).toBe(8);

      // Test one decimal place
      const response2 = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 8.5, movieId: movieId })
        .expect(201);

      const body2 = response2.body as Rating;
      expect(body2.score).toBe(8.5);
    });

    it('should validate field lengths', async () => {
      const invalidRatingDto = {
        score: 8.5,
        reviewerName: 'a'.repeat(101), // Too long
        source: 'b'.repeat(51), // Too long
        movieId: movieId,
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toContain(
        'reviewerName must be shorter than or equal to 100 characters',
      );
      expect(body.message).toContain(
        'source must be shorter than or equal to 50 characters',
      );
    });

    it('should reject rating for non-existent movie', async () => {
      const createRatingDto = {
        score: 8.5,
        movieId: 99999, // Non-existent movie
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(createRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400);
    });

    it('should reject extra properties', async () => {
      const invalidRatingDto = {
        score: 8.5,
        movieId: movieId,
        extraProperty: 'should not be allowed',
      };

      const response = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidRatingDto)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400, 'property extraProperty should not exist');
    });
  });

  describe('GET /ratings', () => {
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie with Ratings',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;

      // Create test ratings
      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 8.0,
          review: 'Good movie',
          reviewerName: 'Reviewer 1',
          source: 'Source 1',
          movieId: movieId,
        });

      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 9.0,
          review: 'Excellent movie',
          reviewerName: 'Reviewer 2',
          source: 'Source 2',
          movieId: movieId,
        });
    });

    it('should return all ratings', async () => {
      const response = await request(app.getHttpServer())
        .get('/ratings')
        .expect(200);

      const body = response.body as Rating[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      expect(body[0]).toHaveProperty('score');
      expect(body[0]).toHaveProperty('movieId');
      expect(body[0]).toHaveProperty('movie');
    });
  });

  describe('GET /ratings/:id', () => {
    let ratingId: number;
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie for Single Rating',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;

      const ratingResponse = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 8.5,
          review: 'Great movie',
          movieId: movieId,
        });
      ratingId = (ratingResponse.body as Rating).id;
    });

    it('should return a rating by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ratings/${ratingId}`)
        .expect(200);

      const body = response.body as Rating;

      expect(body).toHaveProperty('id', ratingId);
      expect(body).toHaveProperty('score', 8.5);
      expect(body).toHaveProperty('review', 'Great movie');
      expect(body).toHaveProperty('movieId', movieId);
    });

    it('should return 404 for non-existent rating', async () => {
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

    it('should return 400 for invalid ID format', async () => {
      await request(app.getHttpServer()).get('/ratings/invalid-id').expect(400);
    });
  });

  describe('GET /ratings/movie/:movieId', () => {
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie with Multiple Ratings',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;

      // Create multiple ratings for the movie
      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 7.0, movieId: movieId });

      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 8.0, movieId: movieId });

      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 9.0, movieId: movieId });
    });

    it('should return all ratings for a movie', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ratings/movie/${movieId}`)
        .expect(200);

      const body = response.body as Rating[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(3);
      body.forEach((rating: Rating) => {
        expect(rating.movieId).toBe(movieId);
      });
    });

    it('should return empty array for movie with no ratings', async () => {
      // Create another movie without ratings
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie without Ratings',
          releaseYear: 2023,
          duration: 120,
        });

      const response = await request(app.getHttpServer())
        .get(`/ratings/movie/${(movieResponse.body as Movie).id}`)
        .expect(200);
      const body = response.body as Rating[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });

  describe('GET /ratings/movie/:movieId/average', () => {
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie for Average Rating',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;
    });

    it('should calculate average rating', async () => {
      // Create ratings: 8.0, 9.0 -> average = 8.5
      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 8.0, movieId: movieId });

      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 9.0, movieId: movieId });

      const response = await request(app.getHttpServer())
        .get(`/ratings/movie/${movieId}/average`)
        .expect(200);

      const body = response.body as {
        average: number;
        count: number;
      };

      expect(body).toHaveProperty('average', 8.5);
      expect(body).toHaveProperty('count', 2);
    });

    it('should return null for movie with no ratings', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ratings/movie/${movieId}/average`)
        .expect(200);

      const body = response.body as {
        average: number;
        count: number;
      };

      expect(body).toBeNull();
    });

    it('should handle single rating', async () => {
      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 7.5, movieId: movieId });

      const response = await request(app.getHttpServer())
        .get(`/ratings/movie/${movieId}/average`)
        .expect(200);

      const body = response.body as {
        average: number;
        count: number;
      };

      expect(body).toHaveProperty('average', 7.5);
      expect(body).toHaveProperty('count', 1);
    });
  });

  describe('PATCH /ratings/:id', () => {
    let ratingId: number;
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie for Rating Update',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;

      const ratingResponse = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 7.0,
          review: 'Original review',
          reviewerName: 'Original Reviewer',
          movieId: movieId,
        });
      ratingId = (ratingResponse.body as Rating).id;
    });

    it('should update a rating', async () => {
      const updateData = {
        score: 9.0,
        review: 'Updated review - much better!',
      };

      const response = await request(app.getHttpServer())
        .patch(`/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(updateData)
        .expect(200);

      const body = response.body as Rating;

      expect(body.score).toBe(updateData.score);
      expect(body.review).toBe(updateData.review);
      expect(body.reviewerName).toBe('Original Reviewer'); // Should remain unchanged
      expect(body.movieId).toBe(movieId); // Should remain unchanged
    });

    it('should require API key for update', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ratings/${ratingId}`)
        .send({ score: 9.0 })
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should return 404 for non-existent rating', async () => {
      const response = await request(app.getHttpServer())
        .patch('/ratings/99999')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({ score: 9.0 })
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });

    it('should validate updated score range', async () => {
      const invalidUpdateData = {
        score: 11.0, // Above maximum
      };

      const response = await request(app.getHttpServer())
        .patch(`/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(invalidUpdateData)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400, 'score must not be greater than 10');
    });

    it('should not allow movieId updates', async () => {
      // Create another movie
      const anotherMovieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Another Movie',
          releaseYear: 2024,
          duration: 90,
        });

      const updateData = {
        movieId: (anotherMovieResponse.body as Movie).id, // Should not be allowed
      };

      const response = await request(app.getHttpServer())
        .patch(`/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .send(updateData)
        .expect(400);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 400, 'property movieId should not exist');
    });
  });

  describe('DELETE /ratings/:id', () => {
    let ratingId: number;
    let movieId: number;

    beforeEach(async () => {
      const movieResponse = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie for Rating Deletion',
          releaseYear: 2023,
          duration: 120,
        });
      movieId = (movieResponse.body as Movie).id;

      const ratingResponse = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 8.0,
          movieId: movieId,
        });
      ratingId = (ratingResponse.body as Rating).id;
    });

    it('should delete a rating', async () => {
      await request(app.getHttpServer())
        .delete(`/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(204);

      // Verify rating is deleted
      await request(app.getHttpServer())
        .get(`/ratings/${ratingId}`)
        .expect(404);
    });

    it('should require API key for deletion', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/ratings/${ratingId}`)
        .expect(401);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 401, 'Invalid API key');
    });

    it('should return 404 for non-existent rating', async () => {
      const response = await request(app.getHttpServer())
        .delete('/ratings/99999')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(404);

      const body = response.body as {
        path: string;
        method: string;
        message: string[];
      };

      expectErrorResponse(body, 404);
    });
  });
});
