/**
 * React Query hooks. Query keys are namespaced by facility so switching the
 * active facility refetches the right slice. Mutations invalidate the lists they
 * affect.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useSession } from "@/app/session";
import type {
  AssignmentState,
  ID,
  ModuleKey,
  RoomCleanliness,
} from "@/domain/types";
import {
  assignmentRepository,
  type AssignmentCreateInput,
  cleanupRepository,
  consumptionRepository,
  facilityRepository,
  feedbackRepository,
  lostAndFoundRepository,
  questionnaireRepository,
  realmRepository,
  reservationRepository,
  roleRepository,
  sectorRepository,
  spaceRepository,
  userRepository,
  type AssignmentFilter,
  type SpaceFilter,
  type UserPatch,
} from "@/mock/repository";

export function useFacilities() {
  return useQuery({ queryKey: ["facilities"], queryFn: () => facilityRepository.list() });
}

export function useSpaces(filter: SpaceFilter = {}) {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["spaces", facilityId, filter],
    queryFn: () => spaceRepository.list(facilityId, filter),
  });
}

export function useSectors() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["sectors", facilityId],
    queryFn: () => sectorRepository.listByFacility(facilityId),
  });
}

export function useSetCleanliness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cleanliness }: { id: ID; cleanliness: RoomCleanliness }) =>
      spaceRepository.setCleanliness(id, cleanliness),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useAssignments(filter: AssignmentFilter = {}) {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["assignments", facilityId, filter],
    queryFn: () => assignmentRepository.list(facilityId, filter),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const facilityId = useSession((s) => s.facilityId);
  return useMutation({
    mutationFn: (input: Omit<AssignmentCreateInput, "facilityId">) =>
      assignmentRepository.create({ ...input, facilityId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useSetAssignmentState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, state }: { id: ID; state: AssignmentState }) =>
      assignmentRepository.setState(id, state),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, todoId }: { assignmentId: ID; todoId: ID }) =>
      assignmentRepository.toggleTodo(assignmentId, todoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useUsers() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["users", facilityId],
    queryFn: () => userRepository.listByFacility(facilityId),
  });
}

export function useCleanups() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["cleanups", facilityId],
    queryFn: () => cleanupRepository.listByFacility(facilityId),
  });
}

export function useCleanupsByAssignee(assigneeId: ID | undefined) {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["cleanups", facilityId, "assignee", assigneeId],
    queryFn: () => cleanupRepository.listByAssignee(facilityId, assigneeId as ID),
    enabled: Boolean(assigneeId),
  });
}

export function useAssignCleanups() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceIds, assigneeId }: { spaceIds: ID[]; assigneeId: ID }) =>
      cleanupRepository.assign(spaceIds, assigneeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cleanups"] });
    },
  });
}

export function useClearCleanups() {
  const queryClient = useQueryClient();
  const facilityId = useSession((s) => s.facilityId);
  return useMutation({
    mutationFn: () => cleanupRepository.clearAssignments(facilityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cleanups"] });
    },
  });
}

export function useLostAndFound() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["lostAndFound", facilityId],
    queryFn: () => lostAndFoundRepository.listByFacility(facilityId),
  });
}

export function useQuestionnaires() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["questionnaires", facilityId],
    queryFn: () => questionnaireRepository.listByFacility(facilityId),
  });
}

export function useFeedback() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["feedback", facilityId],
    queryFn: () => feedbackRepository.listByFacility(facilityId),
  });
}

export function useReservations() {
  const facilityId = useSession((s) => s.facilityId);
  return useQuery({
    queryKey: ["reservations", facilityId],
    queryFn: () => reservationRepository.listByFacility(facilityId),
  });
}

export function useConsumption(spaceId: ID | undefined) {
  return useQuery({
    queryKey: ["consumption", spaceId],
    queryFn: () => consumptionRepository.listBySpace(spaceId as ID),
    enabled: Boolean(spaceId),
  });
}

/* Settings: roles, staff and the property structure. These are realm-level and
 * intentionally not scoped to the active facility. */

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: () => roleRepository.list() });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title }: { title: string }) => roleRepository.create(title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, menuItems }: { id: ID; menuItems: ModuleKey[] }) =>
      roleRepository.update(id, { menuItems }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useStaff() {
  return useQuery({ queryKey: ["staff"], queryFn: () => userRepository.list() });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UserPatch }) =>
      userRepository.update(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRealms() {
  return useQuery({ queryKey: ["realms"], queryFn: () => realmRepository.list() });
}

export function useAllSectors() {
  return useQuery({ queryKey: ["sectors", "all"], queryFn: () => sectorRepository.list() });
}

export function useSpaceCounts() {
  return useQuery({
    queryKey: ["space-counts"],
    queryFn: () => spaceRepository.countsBySector(),
  });
}

export function useSetFacilityActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: ID; isActive: boolean }) =>
      facilityRepository.setActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}
