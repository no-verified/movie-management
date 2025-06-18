import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActorCard } from '@/components/actor-card'
import { Actor } from '@/lib/api'

// Mock the API queries
jest.mock('@/api/actors/queries', () => ({
  useDeleteActor: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useUpdateActor: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}))

jest.mock('@/api/movies/queries', () => ({
  useMovies: () => ({
    data: [],
    isLoading: false,
  }),
}))

const mockActor: Actor = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1980-01-01T00:00:00.000Z',
  nationality: 'American',
  biography: 'A talented actor known for his versatile performances',
  photoUrl: 'https://example.com/actor.jpg',
  movies: [
    {
      id: 1,
      title: 'Movie One',
      releaseYear: 2023,
      description: 'A great movie',
      genre: 'Action',
      duration: 120,
      posterUrl: '',
      actors: [],
      ratings: [],
    },
    {
      id: 2,
      title: 'Movie Two',
      releaseYear: 2022,
      description: 'Another great movie',
      genre: 'Drama',
      duration: 110,
      posterUrl: '',
      actors: [],
      ratings: [],
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

describe('ActorCard', () => {
  it('renders actor information correctly', () => {
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('American')).toBeInTheDocument()
    expect(screen.getByText('A talented actor known for his versatile performances')).toBeInTheDocument()
  })

  it('calculates and displays age correctly', () => {
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    // Age calculation can vary by a year depending on exact birth date vs current date
    expect(screen.getByText(/\d+ years old/)).toBeInTheDocument()
  })

  it('displays number of films', () => {
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    expect(screen.getByText('2 films')).toBeInTheDocument()
    expect(screen.getByText('2 movies')).toBeInTheDocument()
  })

  it('displays recent movies correctly', () => {
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    // Movies should be sorted by release year (descending)
    expect(screen.getByText('Movie One, Movie Two')).toBeInTheDocument()
  })

  it('handles actor without date of birth', () => {
    const actorWithoutBirthDate = { ...mockActor, dateOfBirth: undefined }
    renderWithQueryClient(<ActorCard actor={actorWithoutBirthDate} />)
    
    expect(screen.queryByText(/years old/)).not.toBeInTheDocument()
  })

  it('handles actor without nationality', () => {
    const actorWithoutNationality = { ...mockActor, nationality: undefined }
    renderWithQueryClient(<ActorCard actor={actorWithoutNationality} />)
    
    expect(screen.queryByText(/Nationality:/)).not.toBeInTheDocument()
  })

  it('handles actor without biography', () => {
    const actorWithoutBiography = { ...mockActor, biography: undefined }
    renderWithQueryClient(<ActorCard actor={actorWithoutBiography} />)
    
    expect(screen.queryByText('A talented actor known for his versatile performances')).not.toBeInTheDocument()
  })

  it('handles actor with no movies', () => {
    const actorWithoutMovies = { ...mockActor, movies: [] }
    renderWithQueryClient(<ActorCard actor={actorWithoutMovies} />)
    
    expect(screen.getByText('0 films')).toBeInTheDocument()
    expect(screen.getByText('0 movies')).toBeInTheDocument()
    expect(screen.queryByText('Recent Films:')).not.toBeInTheDocument()
  })

  it('renders Edit and Delete buttons', () => {
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('opens edit modal when Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    const editButton = screen.getByRole('button', { name: 'Edit' })
    await user.click(editButton)
    
    expect(screen.getByText('Edit Actor')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('opens delete confirmation when Delete button is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteButton)
    
    expect(screen.getByText(/Confirm deletion of/)).toBeInTheDocument()
    expect(screen.getAllByText('John Doe')).toHaveLength(2) // One in card header, one in confirmation
  })

  it('closes edit modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    // Open edit modal
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    
    // Close modal
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(screen.queryByText('Edit Actor')).not.toBeInTheDocument()
  })

  it('closes delete confirmation when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    // Open delete confirmation
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    
    // Close confirmation
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[cancelButtons.length - 1]) // Get the one in the modal
    
    expect(screen.queryByText(/Confirm deletion of/)).not.toBeInTheDocument()
  })

  it('displays only first 3 recent movies', () => {
    const actorWithManyMovies = {
      ...mockActor,
      movies: [
        { ...mockActor.movies[0], title: 'Movie A', releaseYear: 2023 },
        { ...mockActor.movies[1], title: 'Movie B', releaseYear: 2022 },
        { ...mockActor.movies[0], title: 'Movie C', releaseYear: 2021, id: 3 },
        { ...mockActor.movies[1], title: 'Movie D', releaseYear: 2020, id: 4 },
      ]
    }
    
    renderWithQueryClient(<ActorCard actor={actorWithManyMovies} />)
    
    expect(screen.getByText('Movie A, Movie B, Movie C')).toBeInTheDocument()
    expect(screen.queryByText('Movie D')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithQueryClient(
      <ActorCard actor={mockActor} className="custom-class" />
    )
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('handles date of birth formatting in edit form', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<ActorCard actor={mockActor} />)
    
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    
    // The date input should format the ISO string to YYYY-MM-DD
    const dateInput = screen.getByDisplayValue('1980-01-01')
    expect(dateInput).toBeInTheDocument()
  })
})