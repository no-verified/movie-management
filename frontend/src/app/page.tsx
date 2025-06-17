"use client";

import {useRouter} from "next/navigation";
import {MovieCard} from "@/components/movie-card";
import {ActorCard} from "@/components/actor-card";
import {Button} from "@/components/ui/button";
import {SearchBar} from "@/components/search-bar";
import {useRecentMovies} from "@/api/movies/queries";
import {useRecentActors} from "@/api/actors/queries";

export default function Home() {
  const router = useRouter();

  // On charge les films et acteurs récents pour la home page
  const {data: movies = [], isLoading: isLoadingMovies} = useRecentMovies();
  const {data: actors = [], isLoading: isLoadingActors} = useRecentActors();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleViewMovies = () => {
    router.push("/movies");
  };

  const handleViewActors = () => {
    router.push("/actors");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <section className="mb-8 sm:mb-12 text-center">
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap mb-6 sm:mb-8">
            <Button
              variant="default"
              size="sm"
              className="sm:text-base"
              onClick={handleViewMovies}
            >
              Browse Movies
            </Button>
            <Button
              variant="neutral"
              size="sm"
              className="sm:text-base"
              onClick={handleViewActors}
            >
              Discover Actors
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              placeholder="Search movies, actors, or genres..."
              onSearch={handleSearch}
            />
          </div>
        </section>

        {/* Featured Movies */}
        <section className="mb-8 sm:mb-12">
          <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2">
            Featured Movies
          </h3>
          {isLoadingMovies ? (
            <div className="text-center py-8">Loading movies...</div>
          ) : movies.length === 0 ? (
            <div className="text-center py-8 text-destructive-foreground">
              <div className="text-6xl mb-4">🎬</div>
              <h4 className="text-xl font-bold mb-2">No Movies Available</h4>
              <p className="mb-2">
                You need to seed the database first with the command:
                <br />
                <code>make seed</code> at the root of the project
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  showDetailsButton={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Actors */}
        <section className="mb-8 sm:mb-12">
          <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2">
            Featured Actors
          </h3>
          {isLoadingActors ? (
            <div className="text-center py-8">Loading actors...</div>
          ) : actors.length === 0 ? (
            <div className="text-center py-8 text-destructive-foreground">
              <div className="text-6xl mb-4">🎭</div>
              <h4 className="text-xl font-bold mb-2">No Actors Available</h4>
              <p className="mb-2">
                You need to seed the database first with the command:
                <br />
                <code>make seed</code> at the root of the project
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {actors.map((actor) => (
                <ActorCard
                  key={actor.id}
                  actor={actor}
                  showDetailsButton={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center bg-main text-main-foreground p-6 sm:p-8 border-3 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 text-xl sm:text-2xl font-bold uppercase tracking-wide">
            Ready to Explore More?
          </h3>
          <p className="mb-6 text-sm sm:text-base md:text-lg opacity-90 px-4">
            Dive deeper into our massive collection of movies and discover new
            favorites!
          </p>
          <Button
            variant="neutral"
            size="default"
            className="text-sm sm:text-base"
          >
            Start Exploring
          </Button>
        </section>
      </main>
    </div>
  );
}
