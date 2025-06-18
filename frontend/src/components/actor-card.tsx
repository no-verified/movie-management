import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Actor} from "@/lib/api";
import {useState} from "react";
import {useDeleteActor, useUpdateActor} from "@/api/actors/queries";
import {useMovies} from "@/api/movies/queries";
import {UpdateActorData} from "@/lib/api";
import {BaseCard} from "@/components/base-card";
import {CardTitle} from "@/components/ui/card";

interface ActorCardProps {
  actor: Actor;
  className?: string;
  onViewDetails?: (actorId: number) => void;
  showDetailsButton?: boolean;
  onDelete?: (id: number) => void;
}

export function ActorCard({actor, className, onDelete}: ActorCardProps) {
  const fullName = `${actor.firstName} ${actor.lastName}`;
  const age = actor.dateOfBirth
    ? new Date().getFullYear() - new Date(actor.dateOfBirth).getFullYear()
    : null;

  const recentMovies = actor.movies
    .sort((a, b) => b.releaseYear - a.releaseYear)
    .slice(0, 3)
    .map((movie) => movie.title)
    .join(", ");

  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteConfirm, setDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateActorData>({});
  const deleteActorMutation = useDeleteActor();
  const updateActorMutation = useUpdateActor();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const {data: allMovies = [], isLoading: moviesLoading} = useMovies();

  return (
    <BaseCard
      imageUrl={actor.photoUrl}
      imageAlt={fullName}
      className={className}
      renderBadge={
        <div className="bg-main text-main-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {actor.movies.length} films
        </div>
      }
    >
      <CardTitle className="mb-2 text-base sm:text-lg font-bold uppercase tracking-wide">
        {fullName}
      </CardTitle>

      <div className="mb-3 space-y-1 text-xs sm:text-sm">
        {actor.nationality && (
          <div className="flex justify-between items-center">
            <span className="font-bold">Nationality:</span>
            <span className="bg-main text-main-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold border border-border">
              {actor.nationality}
            </span>
          </div>
        )}
        {age && (
          <div className="flex justify-between">
            <span className="font-bold">Age:</span>
            <span>{age} years old</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-bold">Films:</span>
          <span>{actor.movies.length} movies</span>
        </div>
      </div>

      {actor.biography && (
        <p className="mb-3 text-xs sm:text-sm text-muted-foreground line-clamp-3">
          {actor.biography}
        </p>
      )}

      {recentMovies && (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase mb-1">Recent Films:</p>
          <p className="text-xs text-gray-600 line-clamp-2">{recentMovies}</p>
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
              <h2 className="text-lg font-bold">Edit Actor</h2>
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
                  await updateActorMutation.mutateAsync({
                    id: actor.id,
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
                <label className="block text-sm font-bold mb-1">
                  First Name
                </label>
                <Input
                  value={editFormData.firstName ?? actor.firstName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Last Name
                </label>
                <Input
                  value={editFormData.lastName ?? actor.lastName}
                  onChange={(e) =>
                    setEditFormData({...editFormData, lastName: e.target.value})
                  }
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={
                    editFormData.dateOfBirth ?? actor.dateOfBirth?.split("T")[0]
                  }
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Nationality
                </label>
                <Input
                  value={editFormData.nationality ?? actor.nationality ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
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
                  value={editFormData.photoUrl ?? actor.photoUrl ?? ""}
                  onChange={(e) =>
                    setEditFormData({...editFormData, photoUrl: e.target.value})
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
                  value={editFormData.biography ?? actor.biography ?? ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      biography: e.target.value,
                    })
                  }
                  placeholder="Biography"
                  rows={4}
                />
              </div>

              {/* Movies Selection */}
              <div>
                <label className="block text-sm font-bold mb-1">Movies</label>
                <div className="border-3 border-border p-3 max-h-40 overflow-y-auto">
                  {moviesLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading movies...
                    </div>
                  ) : allMovies.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No movies available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allMovies.map((movie) => {
                        const currentMovieIds =
                          editFormData.movieIds ??
                          actor.movies.map((m) => m.id);
                        return (
                          <label
                            key={movie.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={currentMovieIds.includes(movie.id)}
                              onChange={(e) => {
                                const currentIds =
                                  editFormData.movieIds ??
                                  actor.movies.map((m) => m.id);
                                if (e.target.checked) {
                                  setEditFormData({
                                    ...editFormData,
                                    movieIds: [...currentIds, movie.id],
                                  });
                                } else {
                                  setEditFormData({
                                    ...editFormData,
                                    movieIds: currentIds.filter(
                                      (id) => id !== movie.id
                                    ),
                                  });
                                }
                              }}
                              className="rounded border-2 border-border"
                            />
                            <span className="text-sm">
                              {movie.title} ({movie.releaseYear})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Selected:{" "}
                  {
                    (editFormData.movieIds ?? actor.movies.map((m) => m.id))
                      .length
                  }{" "}
                  movie(s)
                </div>
              </div>

              {updateError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {updateError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateActorMutation.isPending}
                  className="flex-1"
                  variant="neutral"
                >
                  {updateActorMutation.isPending ? "Updating..." : "Update"}
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
              Confirm deletion of <b>{fullName}</b>?
            </div>
            <div className="flex gap-2">
              <Button
                variant="neutral"
                disabled={deleteActorMutation.isPending}
                onClick={async () => {
                  setDeleteError(null);
                  console.log("Deleting actor with ID:", actor.id);
                  try {
                    await deleteActorMutation.mutateAsync(actor.id);
                    setDeleteConfirm(false);
                    onDelete?.(actor.id);
                  } catch (err) {
                    console.error("Delete error for actor ID:", actor.id, err);
                    setDeleteError(
                      (err as Error)?.message || "Error while deleting"
                    );
                  }
                }}
              >
                {deleteActorMutation.isPending ? "Deleting..." : "Delete"}
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
