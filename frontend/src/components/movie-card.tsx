import {BaseCard} from "@/components/base-card";
import {CardTitle} from "@/components/ui/card";
import {Movie, UpdateMovieData} from "@/lib/api";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useDeleteMovie, useUpdateMovie} from "@/api/movies/queries";

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
  const [editFormData, setEditFormData] = useState<UpdateMovieData>({});
  const deleteMovieMutation = useDeleteMovie();
  const updateMovieMutation = useUpdateMovie();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  return (
    <BaseCard
      imageUrl={movie.posterUrl}
      imageAlt={movie.title}
      className={className}
      renderBadge={
        <div className="bg-main text-main-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ★ {averageRating}
        </div>
      }
    >
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

      <div className="pt-0 mt-auto flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => setEditOpen(true)}
            className="w-1/2 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white border-blue-700"
            variant="neutral"
          >
            Edit
          </Button>
          <Button
            onClick={() => setDeleteConfirm(true)}
            className="w-1/2 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white border-red-700"
            variant="neutral"
          >
            Delete
          </Button>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 min-w-[400px] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Movie</h2>
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditFormData({});
                  setUpdateError(null);
                }}
                className="text-xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUpdateError(null);
                try {
                  await updateMovieMutation.mutateAsync({
                    id: movie.id,
                    data: editFormData,
                  });
                  setEditOpen(false);
                  setEditFormData({});
                } catch (err) {
                  setUpdateError(
                    (err as Error)?.message || "Error while updating"
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <Input
                  value={editFormData.title ?? movie.title}
                  onChange={(e) =>
                    setEditFormData({...editFormData, title: e.target.value})
                  }
                  placeholder="Movie title"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Genre</label>
                <Input
                  value={editFormData.genre ?? movie.genre ?? ""}
                  onChange={(e) =>
                    setEditFormData({...editFormData, genre: e.target.value})
                  }
                  placeholder="Genre"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Release Year
                </label>
                <Input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear() + 10}
                  value={editFormData.releaseYear ?? movie.releaseYear}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      releaseYear: parseInt(e.target.value),
                    })
                  }
                  placeholder="Release year"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.duration ?? movie.duration ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  placeholder="Duration in minutes"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Poster URL
                </label>
                <Input
                  value={editFormData.posterUrl ?? movie.posterUrl ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      posterUrl: e.target.value,
                    })
                  }
                  placeholder="Poster URL"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Description
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-none border-3 border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  value={editFormData.description ?? movie.description ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Movie description"
                  rows={4}
                />
              </div>
              {updateError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {updateError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateMovieMutation.isPending}
                  className="flex-1"
                  variant="neutral"
                >
                  {updateMovieMutation.isPending ? "Updating..." : "Update"}
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => {
                    setEditOpen(false);
                    setEditFormData({});
                    setUpdateError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
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
                  console.log("Deleting movie with ID:", movie.id);
                  try {
                    await deleteMovieMutation.mutateAsync(movie.id);
                    setDeleteConfirm(false);
                    onDelete?.(movie.id);
                  } catch (err) {
                    console.error("Delete error for movie ID:", movie.id, err);
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
    </BaseCard>
  );
}
