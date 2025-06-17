import {useQuery} from "@tanstack/react-query";
import {apiService, Movie, Actor} from "@/lib/api";

export function useSearchAll(query: string) {
  return useQuery<{movies: Movie[]; actors: Actor[]}>({
    queryKey: ["searchAll", query],
    queryFn: () => apiService.searchAll(query),
    enabled: !!query.trim(),
  });
}
