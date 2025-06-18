"use client";

import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import {MovieCard} from "@/components/movie-card";
import {SearchBar} from "@/components/search-bar";
import {Button} from "@/components/ui/button";
import {InfiniteScroll} from "@/components/infinite-scroll";
import {useMoviesInfinite} from "@/api/movies/queries";

export default function MoviesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
        <h1 className="text-4xl font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
          🎬 All Movies
        </h1>
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
    </div>
  );
}
