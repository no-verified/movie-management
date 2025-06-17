import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  clearDatabase,
  API_KEY,
  expectErrorResponse,
  getHttpServer,
} from './shared/test-setup';
import { Actor } from 'src/entities/actor.entity';
import { Movie } from 'src/entities/movie.entity';

describe('Actors API (e2e)', () => {
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

  describe('POST /actors', () => {
    it('should create an actor with valid data', async () => {
      const createActorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        nationality: 'American',
        biography: 'A talented actor',
        photoUrl: 'https://example.com/photo.jpg',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(createActorDto)
        .expect(201);

      const body = response.body as Actor;

      expect(body).toHaveProperty('id');
      expect(body.firstName).toBe(createActorDto.firstName);
      expect(body.lastName).toBe(createActorDto.lastName);
      expect(body.nationality).toBe(createActorDto.nationality);
      expect(body.biography).toBe(createActorDto.biography);
      expect(body.photoUrl).toBe(createActorDto.photoUrl);
    });

    it('should create an actor with minimal required data', async () => {
      const createActorDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1990-05-15',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(createActorDto)
        .expect(201);

      const body = response.body as Actor;

      expect(body).toHaveProperty('id');
    });

    it('should require API key', async () => {
      const createActorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .send(createActorDto)
        .expect(401);

      expectErrorResponse(response.body, 401, 'Invalid API key');
    });

    it('should validate required fields', async () => {
      const invalidActorDto = {
        // Missing firstName, lastName, dateOfBirth
        nationality: 'American',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(invalidActorDto)
        .expect(400);

      const body = response.body as { message: string[] };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(
        body.message.some((msg: string) => msg.includes('firstName')),
      ).toBe(true);
      expect(body.message.some((msg: string) => msg.includes('lastName'))).toBe(
        true,
      );
      expect(
        body.message.some(
          (msg: string) => msg.includes('dateOfBirth') || msg.includes('date'),
        ),
      ).toBe(true);
    });

    it('should validate date format', async () => {
      const invalidActorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: 'invalid-date',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(invalidActorDto)
        .expect(400);

      expectErrorResponse(
        response.body,
        400,
        'dateOfBirth must be a valid ISO 8601 date string',
      );
    });

    it('should validate field lengths', async () => {
      const invalidActorDto = {
        firstName: 'a'.repeat(101), // Too long
        lastName: 'b'.repeat(101), // Too long
        dateOfBirth: '1980-01-01',
        nationality: 'c'.repeat(101), // Too long
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(invalidActorDto)
        .expect(400);

      const body = response.body as { message: string[] };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toContain(
        'firstName must be shorter than or equal to 100 characters',
      );
      expect(body.message).toContain(
        'lastName must be shorter than or equal to 100 characters',
      );
      expect(body.message).toContain(
        'nationality must be shorter than or equal to 100 characters',
      );
    });

    it('should validate photo URL format', async () => {
      const invalidActorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        photoUrl: 'not-a-valid-url',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(invalidActorDto)
        .expect(400);

      expectErrorResponse(response.body, 400, 'photoUrl must be a URL address');
    });

    it('should reject extra properties', async () => {
      const invalidActorDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        extraProperty: 'should not be allowed',
      };

      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send(invalidActorDto)
        .expect(400);

      expectErrorResponse(
        response.body,
        400,
        'property extraProperty should not exist',
      );
    });
  });

  describe('GET /actors', () => {
    beforeEach(async () => {
      // Create test data
      await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1980-01-01',
          nationality: 'American',
        });

      await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          nationality: 'British',
        });
    });

    it('should return all actors', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      expect(body[0]).toHaveProperty('firstName');
      expect(body[0]).toHaveProperty('lastName');
      expect(body[0]).toHaveProperty('dateOfBirth');
    });

    it('should support search by first name', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors?search=John')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].firstName).toBe('John');
    });

    it('should support search by last name', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors?search=Smith')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].lastName).toBe('Smith');
    });

    it('should support search by full name', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors?search=Jane Smith')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].firstName).toBe('Jane');
      expect(body[0].lastName).toBe('Smith');
    });

    it('should return empty array for no matches', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors?search=NonExistent')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });

  describe('GET /actors/:id', () => {
    let actorId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1985-03-20',
        });

      const body = response.body as Actor;

      actorId = body.id;
    });

    it('should return an actor by id', async () => {
      const response = await request(getHttpServer(app))
        .get(`/actors/${actorId}`)
        .expect(200);

      const body = response.body as Actor;

      expect(body).toHaveProperty('id', actorId);
      expect(body).toHaveProperty('firstName', 'Test');
      expect(body).toHaveProperty('lastName', 'Actor');
    });

    it('should return 404 for non-existent actor', async () => {
      const response = await request(getHttpServer(app))
        .get('/actors/99999')
        .expect(404);

      expectErrorResponse(response.body, 404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(getHttpServer(app)).get('/actors/invalid-id').expect(400);
    });
  });

  describe('GET /actors/:id/movies', () => {
    let actorId: number;
    let movieId: number;

    beforeEach(async () => {
      // Create actor
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Test',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
        });
      const body = actorResponse.body as Actor;
      actorId = body.id;

      // Create movie with actor
      const movieResponse = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie with Actor',
          releaseYear: 2023,
          duration: 120,
          actorIds: [actorId],
        });
      const bodyMovie = movieResponse.body as Movie;
      movieId = bodyMovie.id;
    });

    it('should return movies for an actor', async () => {
      const response = await request(getHttpServer(app))
        .get(`/actors/${actorId}/movies`)
        .expect(200);

      const body = response.body as Movie[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0]).toHaveProperty('id', movieId);
      expect(body[0]).toHaveProperty('title', 'Movie with Actor');
    });

    it('should return empty array for actor with no movies', async () => {
      // Create another actor without movies
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'No',
          lastName: 'Movies',
          dateOfBirth: '1990-01-01',
        });

      const actorBody = actorResponse.body as Actor;

      const response = await request(getHttpServer(app))
        .get(`/actors/${actorBody.id}/movies`)
        .expect(200);

      const body = response.body as Movie[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });

  describe('PATCH /actors/:id', () => {
    let actorId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Original',
          lastName: 'Name',
          dateOfBirth: '1980-01-01',
          nationality: 'American',
        });
      const body = response.body as Actor;
      actorId = body.id;
    });

    it('should update an actor', async () => {
      const updateData = {
        firstName: 'Updated',
        biography: 'Updated biography',
      };

      const response = await request(getHttpServer(app))
        .patch(`/actors/${actorId}`)
        .set('x-api-key', API_KEY)
        .send(updateData)
        .expect(200);

      const body = response.body as Actor;

      expect(body.firstName).toBe(updateData.firstName);
      expect(body.biography).toBe(updateData.biography);
      expect(body.lastName).toBe('Name'); // Should remain unchanged
      expect(body.nationality).toBe('American'); // Should remain unchanged
    });

    it('should require API key for update', async () => {
      const response = await request(getHttpServer(app))
        .patch(`/actors/${actorId}`)
        .send({ firstName: 'Updated' })
        .expect(401);

      expectErrorResponse(response.body, 401, 'Invalid API key');
    });

    it('should return 404 for non-existent actor', async () => {
      const response = await request(getHttpServer(app))
        .patch('/actors/99999')
        .set('x-api-key', API_KEY)
        .send({ firstName: 'Updated' })
        .expect(404);

      expectErrorResponse(response.body, 404);
    });

    it('should validate updated fields', async () => {
      const invalidUpdateData = {
        firstName: 'a'.repeat(101), // Too long
        photoUrl: 'not-a-valid-url',
      };

      const response = await request(getHttpServer(app))
        .patch(`/actors/${actorId}`)
        .set('x-api-key', API_KEY)
        .send(invalidUpdateData)
        .expect(400);

      const body = response.body as { message: string[] };

      expectErrorResponse(body, 400);
      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toContain(
        'firstName must be shorter than or equal to 100 characters',
      );
      expect(body.message).toContain('photoUrl must be a URL address');
    });
  });

  describe('DELETE /actors/:id', () => {
    let actorId: number;

    beforeEach(async () => {
      const response = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'To',
          lastName: 'Delete',
          dateOfBirth: '1980-01-01',
        });
      const body = response.body as Actor;
      actorId = body.id;
    });

    it('should delete an actor', async () => {
      await request(getHttpServer(app))
        .delete(`/actors/${actorId}`)
        .set('x-api-key', API_KEY)
        .expect(204);

      // Verify actor is deleted
      await request(getHttpServer(app)).get(`/actors/${actorId}`).expect(404);
    });

    it('should require API key for deletion', async () => {
      const response = await request(getHttpServer(app))
        .delete(`/actors/${actorId}`)
        .expect(401);

      expectErrorResponse(response.body, 401, 'Invalid API key');
    });

    it('should return 404 for non-existent actor', async () => {
      const response = await request(getHttpServer(app))
        .delete('/actors/99999')
        .set('x-api-key', API_KEY)
        .expect(404);

      expectErrorResponse(response.body, 404);
    });
  });

  describe('GET /actors/recent', () => {
    it('should return recent actors', async () => {
      // Create actor with movie and rating (required for recent actors)
      // Recent actors require all fields to be populated
      const actorResponse = await request(getHttpServer(app))
        .post('/actors')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Recent',
          lastName: 'Actor',
          dateOfBirth: '1980-01-01',
          nationality: 'American',
          biography: 'A talented recent actor',
          photoUrl: 'https://example.com/recent-actor.jpg',
        });

      const movieResponse = await request(getHttpServer(app))
        .post('/movies')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          title: 'Movie with Recent Actor',
          releaseYear: 2024,
          duration: 120,
          actorIds: [(actorResponse.body as Actor).id],
        });

      const movieBody = movieResponse.body as Movie;

      await request(getHttpServer(app))
        .post('/ratings')
        .set('Authorization', `Bearer ${API_KEY}`)
        .send({
          score: 9.0,
          movieId: movieBody.id,
        });

      const response = await request(getHttpServer(app))
        .get('/actors/recent')
        .expect(200);

      const body = response.body as Actor[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].firstName).toBe('Recent');
      expect(body[0].lastName).toBe('Actor');
      // Recent actors logic is complex - just verify structure
    });
  });
});
