"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {ActorCard} from "@/components/actor-card";
import {SearchBar} from "@/components/search-bar";
import {Button} from "@/components/ui/button";
import {apiService, Actor} from "@/lib/api";

export default function ActorsPage() {
  const router = useRouter();
  const [actors, setActors] = useState<Actor[]>([]);
  const [filteredActors, setFilteredActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadActors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const actorsData = await apiService.getActors();
        setActors(actorsData);
        setFilteredActors(actorsData);
      } catch (err) {
        setError("Failed to load actors");
        console.error("Error loading actors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadActors();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredActors(actors);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await apiService.searchActors(query);
      setFilteredActors(searchResults);
    } catch (err) {
      console.error("Search error:", err);
      setFilteredActors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setFilteredActors(actors);
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
          🎭 All Actors
        </h1>
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
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}" (${filteredActors.length} actors)`
                : `All Actors (${filteredActors.length} actors)`}
            </h2>
            <p className="text-muted-foreground">
              Discover talented actors from our collection
            </p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredActors.length === 0 && (
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
        {!isLoading && !error && filteredActors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredActors.map((actor) => (
              <ActorCard
                key={actor.id}
                actor={actor}
                onViewDetails={(id) => router.push(`/actors/${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
