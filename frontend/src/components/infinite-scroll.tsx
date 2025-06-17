"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function InfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
  className = "",
  threshold = 0.8,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadingRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold,
        rootMargin: "100px",
      }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

  return (
    <div className={className}>
      {children}
      
      {/* Trigger zone for infinite scroll */}
      <div ref={loadingRef} className="w-full">
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg font-medium">Loading more movies...</p>
          </div>
        )}
        
        {!hasNextPage && !isFetchingNextPage && (
          <div className="text-center py-8 text-muted-foreground">
            <p>You've reached the end of the collection</p>
          </div>
        )}
      </div>
    </div>
  );
}