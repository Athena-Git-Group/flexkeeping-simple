/**
 * Session store: the currently selected facility and the acting user. In a real
 * build these come from auth + a facility picker bound to the backend; here they
 * are plain client state.
 */

import { create } from "zustand";

interface SessionState {
  facilityId: string;
  currentUserName: string;
  setFacility: (facilityId: string) => void;
}

export const useSession = create<SessionState>((set) => ({
  facilityId: "fac-harbor",
  currentUserName: "Rui Pereira",
  setFacility: (facilityId) => set({ facilityId }),
}));
