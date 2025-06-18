"use client";

import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {MovieCard} from "@/components/movie-card";
import {SearchBar} from "@/components/search-bar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {useMoviesInfinite, useCreateMovie} from "@/api/movies/queries";
import {CreateMovieData} from "@/lib/api";

export default function MoviesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateMovieData>({
    title: "",
    description: "",
    genre: "",
    releaseYear: new Date().getFullYear(),
    duration: 0,
    posterUrl: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const createMovieMutation = useCreateMovie();

  // Utilisation de useInfiniteQuery pour charger les films avec pagination
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMoviesInfinite(searchQuery.trim() ? searchQuery : undefined);

  // Flatten all pages into a single array of movies
  const movies = useMemo(() => {
    return data?.pages.flatMap((page) => page.movies || []) || [];
  }, [data]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // refetch automatique car searchQuery change
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto my-8">
        <Button
          onClick={() => router.push("/")}
          variant="neutral"
          className="mb-4"
        >
          ← Home
        </Button>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            🎬 All Movies
          </h1>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="neutral"
            className="bg-green-600 hover:bg-green-700 text-white border-green-800"
          >
            + Add Movie
          </Button>
        </div>
        <SearchBar
          placeholder="Search movies by title, genre, or description... (e.g. 'jura')"
          onSearch={handleSearch}
          onClear={handleClear}
          initialValue={searchQuery}
          className="max-w-2xl"
        />
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg font-medium">Loading movies...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <div className="bg-destructive text-destructive-foreground p-4 border-3 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
              <p className="font-bold">Error!</p>
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to load movies"}
              </p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !isError && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}" (${movies.length} movies)`
                : `All Movies (${movies.length} movies)`}
            </h2>
            <p className="text-muted-foreground">
              Discover amazing films from our collection
            </p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isError && movies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold mb-2">
              {searchQuery ? "No Movies Found" : "No Movies Available"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `We couldn't find any movies matching "${searchQuery}".`
                : "There are no movies in the database yet. Did you forget to seed the database?"}
            </p>
            {searchQuery && (
              <Button onClick={handleClear} variant="neutral">
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Movies Grid with Infinite Scroll */}
        {!isLoading && !isError && movies.length > 0 && (
          <InfiniteScroll
            hasNextPage={hasNextPage || false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </main>

      {/* Create Movie Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 min-w-[400px] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add New Movie</h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateFormData({
                    title: "",
                    description: "",
                    genre: "",
                    releaseYear: new Date().getFullYear(),
                    duration: 0,
                    posterUrl: "",
                  });
                  setCreateError(null);
                }}
                className="text-xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateError(null);
                try {
                  await createMovieMutation.mutateAsync(createFormData);
                  setIsCreateOpen(false);
                  setCreateFormData({
                    title: "",
                    description: "",
                    genre: "",
                    releaseYear: new Date().getFullYear(),
                    duration: 0,
                    posterUrl: "",
                  });
                } catch (err) {
                  setCreateError(
                    (err as Error)?.message || "Error while creating movie"
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold mb-1">Title *</label>
                <Input
                  value={createFormData.title}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, title: e.target.value})
                  }
                  placeholder="Movie title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Genre</label>
                <Input
                  value={createFormData.genre}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, genre: e.target.value})
                  }
                  placeholder="Genre"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Release Year</label>
                <Input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear() + 10}
                  value={createFormData.releaseYear}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, releaseYear: parseInt(e.target.value)})
                  }
                  placeholder="Release year"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={createFormData.duration}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, duration: parseInt(e.target.value)})
                  }
                  placeholder="Duration in minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Poster URL</label>
                <Input
                  value={createFormData.posterUrl}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, posterUrl: e.target.value})
                  }
                  placeholder="Poster URL"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-none border-3 border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({...createFormData, description: e.target.value})
                  }
                  placeholder="Movie description"
                  rows={4}
                />
              </div>
              {createError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {createError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createMovieMutation.isPending}
                  className="flex-1"
                  variant="neutral"
                >
                  {createMovieMutation.isPending ? "Creating..." : "Create Movie"}
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setCreateFormData({
                      title: "",
                      description: "",
                      genre: "",
                      releaseYear: new Date().getFullYear(),
                      duration: 0,
                      posterUrl: "",
                    });
                    setCreateError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
