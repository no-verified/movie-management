import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {ReactNode} from "react";

interface BaseCardProps {
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
  renderBadge?: ReactNode;
  children: ReactNode;
  imageClassName?: string;
}

export function BaseCard({
  imageUrl,
  imageAlt,
  className,
  renderBadge,
  children,
  imageClassName,
}: BaseCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between h-full w-full max-w-sm overflow-hidden p-0",
        className
      )}
    >
      {imageUrl && (
        <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden p-0 m-0">
          <Image
            src={imageUrl}
            alt={imageAlt || ""}
            fill
            className={cn("object-cover w-full h-full", imageClassName)}
            sizes="(max-width: 640px) 100vw, 400px"
          />
          {renderBadge && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
              {renderBadge}
            </div>
          )}
        </div>
      )}
      <CardContent className="flex-1 flex flex-col p-3 sm:p-4">
        {children}
      </CardContent>
    </Card>
  );
}
