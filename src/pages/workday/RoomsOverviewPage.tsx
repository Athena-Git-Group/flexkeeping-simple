import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OverviewColumn } from "@/pages/workday/rooms/OverviewColumn";
import {
  RoomModuleModal,
  type RoomModuleId,
} from "@/pages/workday/rooms/RoomModuleModal";
import { SectorsColumn } from "@/pages/workday/rooms/SectorsColumn";
import { UrgentTasksColumn } from "@/pages/workday/rooms/UrgentTasksColumn";

interface Toast {
  id: number;
  message: string;
}

export function RoomsOverviewPage() {
  const { t } = useTranslation();
  const [modal, setModal] = useState<{ module: RoomModuleId; room: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const openModule = useCallback((module: RoomModuleId, room: number) => {
    setModal({ module, room });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const submitModal = useCallback(() => {
    if (!modal) return;
    notify(
      t("workday.rooms.toastCreated", {
        module: t(`workday.rooms.modules.${modal.module}`),
        room: modal.room,
      }),
    );
    setModal(null);
  }, [modal, notify, t]);

  return (
    <div className="flex items-start gap-6 p-6">
      <SectorsColumn />
      <OverviewColumn onOpenModule={openModule} notify={notify} />
      <UrgentTasksColumn notify={notify} />
      {modal && (
        <RoomModuleModal
          module={modal.module}
          room={modal.room}
          onClose={closeModal}
          onSubmit={submitModal}
        />
      )}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
