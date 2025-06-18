"use client";

import {useState, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {SearchBar} from "@/components/search-bar";
import {MovieCard} from "@/components/movie-card";
import {ActorCard} from "@/components/actor-card";
import {Button} from "@/components/ui/button";
import {useSearchAll} from "@/api/search/queries";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "actors">(
    "all"
  );
  const [hasSearched, setHasSearched] = useState(false);

  // Utilisation de TanStack Query pour la recherche combinée
  const {data, isLoading, isError, error} = useSearchAll(query);
  const movies = Array.isArray(data?.movies) ? data.movies : [];
  const actors = Array.isArray(data?.actors) ? data.actors : [];
  const totalResults = movies.length + actors.length;
  const filteredMovies = activeTab === "actors" ? [] : movies;
  const filteredActors = activeTab === "movies" ? [] : actors;

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    // Update URL
    const newUrl = searchQuery
      ? `/search?q=${encodeURIComponent(searchQuery)}`
      : "/search";
    window.history.pushState({}, "", newUrl);
  };

  const handleClear = () => {
    setQuery("");
    setHasSearched(false);
    // Update URL
    window.history.pushState({}, "", "/search");
  };

  // Effectuer la recherche initiale si query existe
  useEffect(() => {
    if (initialQuery) {
      setHasSearched(true);
    }
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto my-8">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
          🔍 Search Movies & Actors
        </h1>
        <SearchBar
          placeholder="Search for movies, actors, genres..."
          onSearch={handleSearch}
          onClear={handleClear}
          initialValue={query}
          className="max-w-2xl"
        />
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg font-medium">Searching...</p>
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
                  : "Failed to search. Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && !isError && (
          <>
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Search Results for &quot;{query}&quot; ({totalResults} results)
              </h2>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={activeTab === "all" ? "default" : "neutral"}
                  onClick={() => setActiveTab("all")}
                  size="sm"
                  disabled={totalResults === 0}
                >
                  All ({totalResults})
                </Button>
                <Button
                  variant={activeTab === "movies" ? "default" : "neutral"}
                  onClick={() => setActiveTab("movies")}
                  size="sm"
                  disabled={movies.length === 0}
                >
                  Movies ({movies.length})
                </Button>
                <Button
                  variant={activeTab === "actors" ? "default" : "neutral"}
                  onClick={() => setActiveTab("actors")}
                  size="sm"
                  disabled={actors.length === 0}
                >
                  Actors ({actors.length})
                </Button>
              </div>
            </div>

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-2xl font-bold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-6">
                  {query
                    ? `We couldn't find any movies or actors matching '${query}'.`
                    : "Did you forget to seed the database?"}
                </p>
                <Button onClick={handleClear} variant="neutral">
                  Clear Search
                </Button>
              </div>
            )}

            {/* Movies Results */}
            {filteredMovies.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
                  Movies ({movies.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      className="h-full"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Actors Results */}
            {filteredActors.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
                  Actors ({actors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredActors.map((actor) => (
                    <ActorCard
                      key={actor.id}
                      actor={actor}
                      className="h-full"
                      showDetailsButton={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
