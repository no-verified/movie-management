import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/search-bar'

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()
  const mockOnClear = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Search movies..." />)
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument()
  })

  it('renders with initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="test query" />)
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
  })

  it('calls onSearch when form is submitted', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    const searchButton = screen.getByRole('button', { name: 'Search' })
    
    await user.type(input, 'test query')
    await user.click(searchButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('calls onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    await user.type(input, 'test query{enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('trims whitespace from query', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    const searchButton = screen.getByRole('button', { name: 'Search' })
    
    await user.type(input, '  test query  ')
    await user.click(searchButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('shows clear button when input has value', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    
    await user.type(input, 'test')
    
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('clears input and calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    await user.type(input, 'test query')
    
    const clearButton = screen.getByText('Clear')
    await user.click(clearButton)
    
    expect(input).toHaveValue('')
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('hides clear button after clearing', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    await user.type(input, 'test')
    await user.click(screen.getByText('Clear'))
    
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar onSearch={mockOnSearch} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})