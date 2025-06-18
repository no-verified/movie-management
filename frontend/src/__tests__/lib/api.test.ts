import { apiService } from '@/lib/api'

// Mock the auth service
jest.mock('@/lib/auth', () => ({
  authService: {
    getAuthHeader: jest.fn(() => 'Bearer mock-token'),
    logout: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('ApiService', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMovies', () => {
    it('fetches movies with default parameters', async () => {
      const mockMovies = [
        { id: 1, title: 'Test Movie', actors: [], ratings: [] }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ movies: mockMovies, total: 1, hasMore: false }),
      } as Response)

      const result = await apiService.getMovies()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/movies?page=1&limit=20',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      )
      expect(result.movies).toEqual(mockMovies)
    })

    it('includes search parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ movies: [], total: 0, hasMore: false }),
      } as Response)

      await apiService.getMovies('action')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/movies?search=action&page=1&limit=20',
        expect.any(Object)
      )
    })
  })

  describe('getActors', () => {
    it('fetches actors with search parameter', async () => {
      const mockActors = [
        { id: 1, firstName: 'John', lastName: 'Doe', movies: [] }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockActors),
      } as Response)

      const result = await apiService.getActors('john')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/actors?search=john',
        expect.any(Object)
      )
      expect(result).toEqual(mockActors)
    })
  })

  describe('deleteMovie', () => {
    it('makes DELETE request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      } as Response)

      await apiService.deleteMovie(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/movies/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      )
    })
  })

  describe('updateMovie', () => {
    it('makes PATCH request with data', async () => {
      const updateData = { title: 'Updated Title' }
      const mockMovie = { id: 1, title: 'Updated Title', actors: [], ratings: [] }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockMovie),
      } as Response)

      const result = await apiService.updateMovie(1, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/movies/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      )
      expect(result).toEqual(mockMovie)
    })
  })

  describe('error handling', () => {
    it('throws error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      await expect(apiService.getMovies()).rejects.toThrow('API Error: 404 Not Found')
    })

    it('handles 401 unauthorized responses', async () => {
      const mockLogout = require('@/lib/auth').authService.logout
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      await expect(apiService.getMovies()).rejects.toThrow('Authentication required')
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('searchAll', () => {
    it('searches both movies and actors', async () => {
      const mockMoviesResponse = { movies: [{ id: 1, title: 'Movie 1' }], total: 1, hasMore: false }
      const mockActors = [{ id: 1, firstName: 'Actor', lastName: 'One' }]
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify(mockMoviesResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify(mockActors),
        } as Response)

      const result = await apiService.searchAll('test')

      expect(result.movies).toEqual(mockMoviesResponse.movies)
      expect(result.actors).toEqual(mockActors)
    })
  })
})