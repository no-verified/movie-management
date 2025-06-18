import {useQuery} from "@tanstack/react-query";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {apiService, Actor, Movie, UpdateActorData, CreateActorData} from "@/lib/api";

export function useActors(search?: string) {
  return useQuery<Actor[]>({
    queryKey: ["actors", {search}],
    queryFn: () => apiService.getActors(search),
  });
}

export function useActor(id: number | undefined) {
  return useQuery<Actor | undefined>({
    queryKey: ["actor", id],
    queryFn: () => (id ? apiService.getActor(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

// Recherche d'acteurs (peut être fusionné avec useActors)
export function useSearchActors(query: string) {
  return useActors(query);
}

export function useActorMovies(id: number | undefined) {
  return useQuery<Movie[]>({
    queryKey: ["actorMovies", id],
    queryFn: () => (id ? apiService.getActorMovies(id) : Promise.resolve([])),
    enabled: !!id,
  });
}

export function useRecentActors() {
  return useQuery<Actor[]>({
    queryKey: ["recentActors"],
    queryFn: () => apiService.getRecentActors(),
  });
}

// Suppression d'acteur
export function useDeleteActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.deleteActor(id),
    onSuccess: () => {
      // Invalider les listes d'acteurs pour rafraîchir
      queryClient.invalidateQueries({queryKey: ["actors"]});
      queryClient.invalidateQueries({queryKey: ["recentActors"]});
    },
  });
}

// Mise à jour d'acteur
export function useUpdateActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: number; data: UpdateActorData}) => 
      apiService.updateActor(id, data),
    onSuccess: (updatedActor) => {
      // Invalider et mettre à jour les caches
      queryClient.invalidateQueries({queryKey: ["actors"]});
      queryClient.invalidateQueries({queryKey: ["recentActors"]});
      queryClient.setQueryData(["actor", updatedActor.id], updatedActor);
    },
  });
}

// Création d'acteur
export function useCreateActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActorData) => apiService.createActor(data),
    onSuccess: (newActor) => {
      // Invalider les listes pour inclure le nouvel acteur
      queryClient.invalidateQueries({queryKey: ["actors"]});
      queryClient.invalidateQueries({queryKey: ["recentActors"]});
      queryClient.setQueryData(["actor", newActor.id], newActor);
    },
  });
}
