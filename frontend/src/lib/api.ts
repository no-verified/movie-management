import {authService} from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  duration: number;
  posterUrl: string;
  actors: Actor[];
  ratings: Rating[];
}

interface Actor {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  biography: string;
  photoUrl: string;
  movies: Movie[];
}

interface Rating {
  id: number;
  score: number;
  review: string;
  reviewerName: string;
  source: string;
  movieId: number;
}

interface PaginatedResponse<T> {
  movies?: T[];
  actors?: T[];
  total: number;
  hasMore: boolean;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Ajouter automatiquement le token JWT pour toutes les requêtes protégées
    const authHeader = authService.getAuthHeader();
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        headers = {...headers, ...(options.headers as Record<string, string>)};
      }
    }

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      // Token expiré ou invalide, rediriger vers la page de connexion
      authService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Movies API
  async getMovies(
    search?: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Movie>> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const searchParam = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/movies${searchParam}`);
  }

  async getRecentMovies(): Promise<Movie[]> {
    return this.request(`/movies/recent`);
  }

  async getMovie(id: number): Promise<Movie> {
    return this.request(`/movies/${id}`);
  }

  async getMovieActors(id: number): Promise<Actor[]> {
    return this.request(`/movies/${id}/actors`);
  }

  // Actors API
  async getActors(search?: string): Promise<Actor[]> {
    const searchParam = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request(`/actors${searchParam}`);
  }

  async getRecentActors(): Promise<Actor[]> {
    return this.request(`/actors/recent`);
  }

  async getActor(id: number): Promise<Actor> {
    return this.request(`/actors/${id}`);
  }

  async getActorMovies(id: number): Promise<Movie[]> {
    return this.request(`/actors/${id}/movies`);
  }

  // Ratings API
  async getMovieRatings(movieId: number): Promise<Rating[]> {
    return this.request(`/ratings/movie/${movieId}`);
  }

  async getAverageRating(movieId: number): Promise<number> {
    return this.request(`/ratings/movie/${movieId}/average`);
  }

  // Search API
  async searchMovies(
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Movie>> {
    return this.getMovies(query, page, limit);
  }

  async searchActors(query: string): Promise<Actor[]> {
    return this.getActors(query);
  }

  async searchAll(query: string): Promise<{movies: Movie[]; actors: Actor[]}> {
    const [moviesResponse, actors] = await Promise.all([
      this.searchMovies(query),
      this.searchActors(query),
    ]);
    return {movies: moviesResponse.movies ?? [], actors};
  }
}

export const apiService = new ApiService();
export type {Movie, Actor, Rating, PaginatedResponse};
