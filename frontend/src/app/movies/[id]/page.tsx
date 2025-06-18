"use client";

import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ActorCard} from "@/components/actor-card";
import {useMovie, useMovieRatings} from "@/api/movies/queries";
import Image from "next/image";

export default function MovieDetailPage() {
  const router = useRouter();
  const params = useParams();
  const movieId = parseInt(params.id as string);

  // Chargement du film et des ratings via TanStack Query
  const {
    data: movie,
    isLoading: isLoadingMovie,
    isError: isErrorMovie,
    error: errorMovie,
  } = useMovie(movieId);
  const {
    data: ratings = [],
    isLoading: isLoadingRatings,
    isError: isErrorRatings,
    error: errorRatings,
  } = useMovieRatings(movieId);

  if (isLoadingMovie || isLoadingRatings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg font-medium">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (isErrorMovie || isErrorRatings || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {errorMovie instanceof Error
              ? errorMovie.message
              : errorRatings instanceof Error
                ? errorRatings.message
                : "The movie you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()} variant="neutral">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, rating) => sum + rating.score, 0) /
          ratings.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto my-8">
        <Button
          onClick={() => router.back()}
          variant="neutral"
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-4xl font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          Movie Details
        </h1>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Movie Hero Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              {movie.posterUrl && (
                <div className="aspect-[2/3] w-full max-w-md mx-auto">
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    width={320}
                    height={480}
                    className="w-full h-full object-cover border-3 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-3xl font-bold uppercase tracking-wide mb-4">
                  {movie.title}
                </h2>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-primary text-primary-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                    {movie.genre}
                  </div>
                  <div className="bg-secondary text-white px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                    {movie.releaseYear}
                  </div>
                  {movie.duration && (
                    <div className="bg-accent text-accent-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                      {movie.duration} min
                    </div>
                  )}
                  <div className="bg-muted text-muted-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                    ★ {averageRating}
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl uppercase tracking-wide">
                    Synopsis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{movie.description}</p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-primary">
                      {movie.actors.length}
                    </div>
                    <div className="text-sm font-medium uppercase">Actors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-secondary">
                      {ratings.length}
                    </div>
                    <div className="text-sm font-medium uppercase">Reviews</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-accent">
                      {movie.releaseYear}
                    </div>
                    <div className="text-sm font-medium uppercase">Year</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-primary">
                      ★ {averageRating}
                    </div>
                    <div className="text-sm font-medium uppercase">Rating</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Cast Section */}
        {movie.actors.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
              Cast ({movie.actors.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movie.actors.map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          </section>
        )}

        {/* Ratings Section */}
        {ratings.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
              Reviews ({ratings.length})
            </h3>
            <div className="grid gap-6">
              {ratings.map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-lg">
                          {rating.reviewerName || "Anonymous"}
                        </div>
                        {rating.source && (
                          <div className="text-sm text-muted-foreground">
                            via {rating.source}
                          </div>
                        )}
                      </div>
                      <div className="bg-accent text-accent-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold">
                        ★ {rating.score}/10
                      </div>
                    </div>
                    {rating.review && (
                      <p className="text-gray-700 leading-relaxed">
                        {rating.review}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
