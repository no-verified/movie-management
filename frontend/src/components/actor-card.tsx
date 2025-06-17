import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Actor} from "@/lib/api";
import Image from "next/image";

interface ActorCardProps {
  actor: Actor;
  className?: string;
  onViewDetails?: (actorId: number) => void;
  showDetailsButton?: boolean;
}

export function ActorCard({
  actor,
  className,
  onViewDetails,
  showDetailsButton = true,
}: ActorCardProps) {
  const fullName = `${actor.firstName} ${actor.lastName}`;
  const age = actor.dateOfBirth
    ? new Date().getFullYear() - new Date(actor.dateOfBirth).getFullYear()
    : null;

  const recentMovies = actor.movies
    .sort((a, b) => b.releaseYear - a.releaseYear)
    .slice(0, 3)
    .map((movie) => movie.title)
    .join(", ");

  return (
    <Card
      className={cn(
        "flex flex-col justify-between h-full min-h-[540px] w-full max-w-sm overflow-hidden",
        className
      )}
    >
      <CardHeader className="p-0">
        {actor.photoUrl && (
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
            <Image
              src={actor.photoUrl}
              alt={fullName}
              width={192}
              height={256}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-main text-main-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {actor.movies.length} films
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
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
      </CardContent>

      {showDetailsButton && (
        <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
          <Button
            onClick={() => onViewDetails?.(actor.id)}
            className="w-full text-xs sm:text-sm"
            variant="neutral"
          >
            View Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
