import {useQuery, useInfiniteQuery} from "@tanstack/react-query";
import {apiService, Movie, Rating, PaginatedResponse} from "@/lib/api";

export function useMoviesInfinite(search?: string) {
  return useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["movies", "infinite", {search}],
    queryFn: ({pageParam = 1}) => apiService.getMovies(search, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useMovies(search?: string) {
  return useQuery<Movie[]>({
    queryKey: ["movies", {search}],
    queryFn: async () => {
      const response = await apiService.getMovies(search, 1, 1000);
      return response.movies || [];
    },
  });
}

export function useMovie(id: number | undefined) {
  return useQuery<Movie | undefined>({
    queryKey: ["movie", id],
    queryFn: () => (id ? apiService.getMovie(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

// Recherche de films (peut être fusionné avec useMovies)
export function useSearchMovies(query: string) {
  return useMovies(query);
}

export function useMovieRatings(movieId: number | undefined) {
  return useQuery<Rating[]>({
    queryKey: ["movieRatings", movieId],
    queryFn: () =>
      movieId ? apiService.getMovieRatings(movieId) : Promise.resolve([]),
    enabled: !!movieId,
  });
}

export function useAverageRating(movieId: number | undefined) {
  return useQuery<number>({
    queryKey: ["averageRating", movieId],
    queryFn: () =>
      movieId ? apiService.getAverageRating(movieId) : Promise.resolve(0),
    enabled: !!movieId,
  });
}

export function useRecentMovies() {
  return useQuery<Movie[]>({
    queryKey: ["recentMovies"],
    queryFn: () => apiService.getRecentMovies(),
  });
}
