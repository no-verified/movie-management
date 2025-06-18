import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {Movie} from "@/lib/api";
import Image from "next/image";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {useDeleteMovie} from "@/api/movies/queries";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showDetailsButton?: boolean;
  onDelete?: (id: number) => void;
}

export function MovieCard({movie, className, onDelete}: MovieCardProps) {
  const averageRating =
    movie.ratings.length > 0
      ? (
          movie.ratings.reduce((sum, rating) => sum + Number(rating.score), 0) /
          movie.ratings.length
        ).toFixed(1)
      : "N/A";

  const actorNames = movie.actors
    .slice(0, 3)
    .map((actor) => `${actor.firstName} ${actor.lastName}`)
    .join(", ");
  const moreActors =
    movie.actors.length > 3 ? ` +${movie.actors.length - 3} more` : "";

  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteConfirm, setDeleteConfirm] = useState(false);
  const deleteMovieMutation = useDeleteMovie();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <Card
      className={cn(
        "flex flex-col justify-between h-full min-h-[540px] w-full max-w-sm overflow-hidden p-0 m-0 border-0",
        className
      )}
    >
      <CardHeader className="p-0 m-0 border-0">
        {movie.posterUrl && (
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden p-0 m-0">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={192}
              height={288}
              className="h-full w-full object-cover object-top block p-0 m-0"
              style={{objectPosition: "top"}}
            />
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-main text-main-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ★ {averageRating}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <CardTitle className="mb-2 text-base sm:text-lg font-bold uppercase tracking-wide line-clamp-2">
          {movie.title}
        </CardTitle>

        <div className="mb-3 space-y-1 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="font-bold">Year:</span>
            <span>{movie.releaseYear}</span>
          </div>
          {movie.duration && (
            <div className="flex justify-between">
              <span className="font-bold">Duration:</span>
              <span>{movie.duration}min</span>
            </div>
          )}
        </div>

        <p className="mb-3 text-xs sm:text-sm text-muted-foreground line-clamp-3">
          {movie.description}
        </p>

        {actorNames && (
          <div className="mb-3">
            <p className="text-xs font-bold uppercase mb-1">Starring:</p>
            <p className="text-xs text-gray-600">
              {actorNames}
              {moreActors}
            </p>
          </div>
        )}
      </CardContent>

      <div className="p-3 sm:p-4 pt-0 mt-auto flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setEditOpen(true)}
            className="w-1/2 text-xs sm:text-sm"
            variant="neutral"
          >
            Edit
          </Button>
          <Button
            onClick={() => setDeleteConfirm(true)}
            className="w-1/2 text-xs sm:text-sm"
            variant="neutral"
          >
            Delete
          </Button>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 min-w-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Movie</h2>
              <button onClick={() => setEditOpen(false)} className="text-xl">
                &times;
              </button>
            </div>
            <div>Edit form here…</div>
          </div>
        </div>
      )}

      {isDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 min-w-[320px]">
            <div className="mb-4">
              Confirm deletion of <b>{movie.title}</b>?
            </div>
            <div className="flex gap-2">
              <Button
                variant="neutral"
                disabled={deleteMovieMutation.isPending}
                onClick={async () => {
                  setDeleteError(null);
                  try {
                    await deleteMovieMutation.mutateAsync(movie.id);
                    setDeleteConfirm(false);
                    onDelete?.(movie.id);
                  } catch (err) {
                    setDeleteError(
                      (err as Error)?.message || "Error while deleting"
                    );
                  }
                }}
              >
                {deleteMovieMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="neutral" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
            {deleteError && (
              <div className="text-red-600 text-xs mt-2">{deleteError}</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
