import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MovieCard } from '@/components/movie-card'
import { Movie } from '@/lib/api'

// Mock the API queries
jest.mock('@/api/movies/queries', () => ({
  useDeleteMovie: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useUpdateMovie: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}))

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  description: 'A test movie description',
  genre: 'Action',
  releaseYear: 2023,
  duration: 120,
  posterUrl: 'https://example.com/poster.jpg',
  actors: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      nationality: 'American',
      biography: 'Test actor',
      photoUrl: 'https://example.com/actor.jpg',
      movies: [],
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-01-01',
      nationality: 'British',
      biography: 'Test actress',
      photoUrl: 'https://example.com/actress.jpg',
      movies: [],
    }
  ],
  ratings: [
    {
      id: 1,
      score: 8,
      review: 'Great movie',
      reviewerName: 'Reviewer 1',
      source: 'IMDb',
      movieId: 1,
    },
    {
      id: 2,
      score: 7,
      review: 'Good movie',
      reviewerName: 'Reviewer 2',
      source: 'Rotten Tomatoes',
      movieId: 1,
    }
  ]
}

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('MovieCard', () => {
  it('renders movie information correctly', () => {
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('A test movie description')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('120min')).toBeInTheDocument()
  })

  it('calculates and displays average rating', () => {
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    // Average of 8 and 7 should be 7.5
    expect(screen.getByText('★ 7.5')).toBeInTheDocument()
  })

  it('displays N/A when no ratings exist', () => {
    const movieWithoutRatings = { ...mockMovie, ratings: [] }
    renderWithQueryClient(<MovieCard movie={movieWithoutRatings} />)
    
    expect(screen.getByText('★ N/A')).toBeInTheDocument()
  })

  it('displays actor names correctly', () => {
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument()
  })

  it('shows "+X more" when there are more than 3 actors', () => {
    const movieWithManyActors = {
      ...mockMovie,
      actors: [
        ...mockMovie.actors,
        { id: 3, firstName: 'Actor', lastName: 'Three', dateOfBirth: '1990-01-01', nationality: 'Canadian', biography: 'Test', photoUrl: '', movies: [] },
        { id: 4, firstName: 'Actor', lastName: 'Four', dateOfBirth: '1990-01-01', nationality: 'Canadian', biography: 'Test', photoUrl: '', movies: [] },
      ]
    }
    
    renderWithQueryClient(<MovieCard movie={movieWithManyActors} />)
    
    expect(screen.getByText(/John Doe, Jane Smith, Actor Three \+1 more/)).toBeInTheDocument()
  })

  it('renders Edit and Delete buttons', () => {
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('opens edit modal when Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    const editButton = screen.getByRole('button', { name: 'Edit' })
    await user.click(editButton)
    
    expect(screen.getByText('Edit Movie')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Movie')).toBeInTheDocument()
  })

  it('opens delete confirmation when Delete button is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteButton)
    
    expect(screen.getByText(/Confirm deletion of/)).toBeInTheDocument()
    expect(screen.getAllByText('Test Movie')).toHaveLength(2) // One in card header, one in confirmation
  })

  it('closes edit modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    // Open edit modal
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    
    // Close modal
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(screen.queryByText('Edit Movie')).not.toBeInTheDocument()
  })

  it('closes delete confirmation when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<MovieCard movie={mockMovie} />)
    
    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    
    // Close confirmation
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[cancelButtons.length - 1]) // Get the one in the modal
    
    expect(screen.queryByText(/Confirm deletion of/)).not.toBeInTheDocument()
  })

  it('calls onDelete when movie is deleted', async () => {
    const mockOnDelete = jest.fn()
    const user = userEvent.setup()
    
    renderWithQueryClient(<MovieCard movie={mockMovie} onDelete={mockOnDelete} />)
    
    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    
    // Confirm deletion
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    await user.click(deleteButtons[deleteButtons.length - 1]) // Get the one in the modal
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1)
    })
  })

  it('displays movie without duration', () => {
    const movieWithoutDuration = { ...mockMovie, duration: undefined }
    renderWithQueryClient(<MovieCard movie={movieWithoutDuration} />)
    
    expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithQueryClient(
      <MovieCard movie={mockMovie} className="custom-class" />
    )
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})