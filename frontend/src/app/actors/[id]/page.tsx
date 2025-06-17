"use client";

import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MovieCard} from "@/components/movie-card";
import {useActor, useActorMovies} from "@/api/actors/queries";

export default function ActorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const actorId = parseInt(params.id as string);

  // Chargement de l'acteur et de ses films via TanStack Query
  const {
    data: actor,
    isLoading: isLoadingActor,
    isError: isErrorActor,
    error: errorActor,
  } = useActor(actorId);
  const {
    data: movies = [],
    isLoading: isLoadingMovies,
    isError: isErrorMovies,
    error: errorMovies,
  } = useActorMovies(actorId);

  if (isLoadingActor || isLoadingMovies) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg font-medium">Loading actor details...</p>
        </div>
      </div>
    );
  }

  if (isErrorActor || isErrorMovies || !actor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold mb-2">Actor Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {errorActor instanceof Error
              ? errorActor.message
              : errorMovies instanceof Error
              ? errorMovies.message
              : "The actor you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()} variant="neutral">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${actor.firstName} ${actor.lastName}`;
  const age = actor.dateOfBirth
    ? new Date().getFullYear() - new Date(actor.dateOfBirth).getFullYear()
    : null;

  const sortedMovies = movies.sort((a, b) => b.releaseYear - a.releaseYear);
  const careerSpan =
    movies.length > 0
      ? `${Math.min(...movies.map((m) => m.releaseYear))} - ${Math.max(
          ...movies.map((m) => m.releaseYear)
        )}`
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
          Actor Profile
        </h1>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Actor Hero Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo */}
            <div className="lg:col-span-1">
              {actor.photoUrl && (
                <div className="aspect-[3/4] w-full max-w-md mx-auto">
                  <img
                    src={actor.photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover border-3 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}
            </div>

            {/* Actor Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-3xl font-bold uppercase tracking-wide mb-4">
                  {fullName}
                </h2>

                <div className="flex flex-wrap gap-4 mb-6">
                  {actor.nationality && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                      {actor.nationality}
                    </div>
                  )}
                  {age && (
                    <div className="bg-secondary text-white px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                      {age} years old
                    </div>
                  )}
                  <div className="bg-accent text-accent-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                    {movies.length} films
                  </div>
                  <div className="bg-muted text-muted-foreground px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                    {careerSpan}
                  </div>
                </div>
              </div>

              {/* Biography */}
              {actor.biography && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl uppercase tracking-wide">
                      Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed">{actor.biography}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-primary">
                      {movies.length}
                    </div>
                    <div className="text-sm font-medium uppercase">Films</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-secondary">
                      {movies.length > 0
                        ? new Date().getFullYear() -
                          Math.min(...movies.map((m) => m.releaseYear))
                        : 0}
                    </div>
                    <div className="text-sm font-medium uppercase">
                      Years Active
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-accent">
                      {movies.length > 0
                        ? Math.max(...movies.map((m) => m.releaseYear))
                        : "N/A"}
                    </div>
                    <div className="text-sm font-medium uppercase">
                      Latest Film
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-primary">
                      {age || "N/A"}
                    </div>
                    <div className="text-sm font-medium uppercase">Age</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Filmography */}
        {movies.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
              Complete Filmography ({movies.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onViewDetails={(id) => router.push(`/movies/${id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Personal Information */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold uppercase tracking-wide border-b-3 border-border pb-2 mb-6">
            Personal Information
          </h3>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2">
                    <span className="font-bold">Full Name:</span> {fullName}
                  </p>
                  <p className="mb-2">
                    <span className="font-bold">Nationality:</span>{" "}
                    {actor.nationality}
                  </p>
                  <p className="mb-2">
                    <span className="font-bold">Date of Birth:</span>{" "}
                    {actor.dateOfBirth}
                  </p>
                  <p className="mb-2">
                    <span className="font-bold">Biography:</span>{" "}
                    {actor.biography}
                  </p>
                </div>
                <div>
                  <img
                    src={actor.photoUrl}
                    alt={fullName}
                    className="w-full h-auto rounded-base border-2 border-border shadow-shadow"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
