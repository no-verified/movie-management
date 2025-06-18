import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMovies, useMovie, useDeleteMovie, useUpdateMovie } from '@/api/movies/queries'
import { apiService } from '@/lib/api'

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getMovies: jest.fn(),
    getMovie: jest.fn(),
    deleteMovie: jest.fn(),
    updateMovie: jest.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Movie Queries', () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useMovies', () => {
    it('fetches movies successfully', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', actors: [], ratings: [] },
        { id: 2, title: 'Movie 2', actors: [], ratings: [] },
      ]
      
      mockApiService.getMovies.mockResolvedValue({
        movies: mockMovies,
        total: 2,
        hasMore: false,
      })

      const { result } = renderHook(() => useMovies(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMovies)
      expect(mockApiService.getMovies).toHaveBeenCalledWith(undefined, 1, 1000)
    })

    it('fetches movies with search parameter', async () => {
      const mockMovies = [
        { id: 1, title: 'Action Movie', actors: [], ratings: [] },
      ]
      
      mockApiService.getMovies.mockResolvedValue({
        movies: mockMovies,
        total: 1,
        hasMore: false,
      })

      const { result } = renderHook(() => useMovies('action'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMovies)
      expect(mockApiService.getMovies).toHaveBeenCalledWith('action', 1, 1000)
    })

    it('handles empty movies response', async () => {
      mockApiService.getMovies.mockResolvedValue({
        movies: undefined,
        total: 0,
        hasMore: false,
      })

      const { result } = renderHook(() => useMovies(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })
  })

  describe('useMovie', () => {
    it('fetches single movie successfully', async () => {
      const mockMovie = { id: 1, title: 'Test Movie', actors: [], ratings: [] }
      
      mockApiService.getMovie.mockResolvedValue(mockMovie)

      const { result } = renderHook(() => useMovie(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMovie)
      expect(mockApiService.getMovie).toHaveBeenCalledWith(1)
    })

    it('does not fetch when id is undefined', () => {
      const { result } = renderHook(() => useMovie(undefined), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(mockApiService.getMovie).not.toHaveBeenCalled()
    })
  })

  describe('useDeleteMovie', () => {
    it('deletes movie successfully', async () => {
      mockApiService.deleteMovie.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteMovie(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApiService.deleteMovie).toHaveBeenCalledWith(1)
    })

    it('handles delete error', async () => {
      const error = new Error('Delete failed')
      mockApiService.deleteMovie.mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteMovie(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })

  describe('useUpdateMovie', () => {
    it('updates movie successfully', async () => {
      const updateData = { title: 'Updated Title' }
      const updatedMovie = { id: 1, title: 'Updated Title', actors: [], ratings: [] }
      
      mockApiService.updateMovie.mockResolvedValue(updatedMovie)

      const { result } = renderHook(() => useUpdateMovie(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: 1, data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(updatedMovie)
      expect(mockApiService.updateMovie).toHaveBeenCalledWith(1, updateData)
    })

    it('handles update error', async () => {
      const error = new Error('Update failed')
      mockApiService.updateMovie.mockRejectedValue(error)

      const { result } = renderHook(() => useUpdateMovie(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ id: 1, data: { title: 'New Title' } })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })
})