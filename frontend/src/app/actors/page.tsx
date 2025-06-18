"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ActorCard} from "@/components/actor-card";
import {SearchBar} from "@/components/search-bar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useActors, useCreateActor} from "@/api/actors/queries";
import {useMovies} from "@/api/movies/queries";
import {CreateActorData} from "@/lib/api";

export default function ActorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateActorData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    biography: "",
    photoUrl: "",
    movieIds: [],
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const createActorMutation = useCreateActor();

  const {
    data: actors = [],
    isLoading,
    error,
  } = useActors(searchQuery || undefined);

  const {
    data: allMovies = [],
    isLoading: moviesLoading,
  } = useMovies();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
            🎭 All Actors
          </h1>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="neutral"
            className="bg-green-600 hover:bg-green-700 text-white border-green-800"
          >
            + Add Actor
          </Button>
        </div>
        <SearchBar
          placeholder="Search actors by name, nationality, or biography..."
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
            <p className="mt-4 text-lg font-medium">Loading actors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-destructive text-destructive-foreground p-4 border-3 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
              <p className="font-bold">Error!</p>
              <p>{error instanceof Error ? error.message : String(error)}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}" (${actors.length} actors)`
                : `All Actors (${actors.length} actors)`}
            </h2>
            <p className="text-muted-foreground">
              Discover talented actors from our collection
            </p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && actors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold mb-2">
              {searchQuery ? "No Actors Found" : "No Actors Available"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `We couldn't find any actors matching "${searchQuery}".`
                : "There are no actors in the database yet. Did you forget to seed the database?"}
            </p>
            {searchQuery && (
              <Button onClick={handleClear} variant="neutral">
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Actors Grid */}
        {!isLoading && !error && actors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {actors.map((actor) => (
              <ActorCard key={actor.id} actor={actor} />
            ))}
          </div>
        )}
      </main>

      {/* Create Actor Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 min-w-[400px] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add New Actor</h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateFormData({
                    firstName: "",
                    lastName: "",
                    dateOfBirth: "",
                    nationality: "",
                    biography: "",
                    photoUrl: "",
                    movieIds: [],
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
                  await createActorMutation.mutateAsync(createFormData);
                  setIsCreateOpen(false);
                  setCreateFormData({
                    firstName: "",
                    lastName: "",
                    dateOfBirth: "",
                    nationality: "",
                    biography: "",
                    photoUrl: "",
                    movieIds: [],
                  });
                } catch (err) {
                  setCreateError(
                    (err as Error)?.message || "Error while creating actor"
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold mb-1">
                  First Name *
                </label>
                <Input
                  value={createFormData.firstName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Last Name *
                </label>
                <Input
                  value={createFormData.lastName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder="Last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={createFormData.dateOfBirth}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Nationality
                </label>
                <Input
                  value={createFormData.nationality}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      nationality: e.target.value,
                    })
                  }
                  placeholder="Nationality"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Photo URL
                </label>
                <Input
                  value={createFormData.photoUrl}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      photoUrl: e.target.value,
                    })
                  }
                  placeholder="Photo URL"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Biography
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-none border-3 border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  value={createFormData.biography}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      biography: e.target.value,
                    })
                  }
                  placeholder="Actor biography"
                  rows={4}
                />
              </div>
              
              {/* Movies Selection */}
              <div>
                <label className="block text-sm font-bold mb-1">Movies</label>
                <div className="border-3 border-border p-3 max-h-40 overflow-y-auto">
                  {moviesLoading ? (
                    <div className="text-sm text-gray-500">Loading movies...</div>
                  ) : allMovies.length === 0 ? (
                    <div className="text-sm text-gray-500">No movies available</div>
                  ) : (
                    <div className="space-y-2">
                      {allMovies.map((movie) => (
                        <label key={movie.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createFormData.movieIds?.includes(movie.id) || false}
                            onChange={(e) => {
                              const movieIds = createFormData.movieIds || [];
                              if (e.target.checked) {
                                setCreateFormData({
                                  ...createFormData,
                                  movieIds: [...movieIds, movie.id],
                                });
                              } else {
                                setCreateFormData({
                                  ...createFormData,
                                  movieIds: movieIds.filter(id => id !== movie.id),
                                });
                              }
                            }}
                            className="rounded border-2 border-border"
                          />
                          <span className="text-sm">
                            {movie.title} ({movie.releaseYear})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Selected: {createFormData.movieIds?.length || 0} movie(s)
                </div>
              </div>

              {createError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {createError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createActorMutation.isPending}
                  className="flex-1"
                  variant="neutral"
                >
                  {createActorMutation.isPending
                    ? "Creating..."
                    : "Create Actor"}
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setCreateFormData({
                      firstName: "",
                      lastName: "",
                      dateOfBirth: "",
                      nationality: "",
                      biography: "",
                      photoUrl: "",
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
