import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Cleanup, Space, User } from "@/domain/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useAssignCleanups,
  useCleanups,
  useClearCleanups,
  useSpaces,
  useUsers,
} from "@/hooks/queries";
import { cn } from "@/lib/cn";

function spaceLabel(spaces: Space[], id: string): string {
  return spaces.find((s) => s.id === id)?.number ?? id;
}

/** Spread pending spaces round-robin across the on-duty housekeepers. */
function planAutoAssign(pending: Cleanup[], housekeepers: User[]): Map<string, string[]> {
  const plan = new Map<string, string[]>();
  if (housekeepers.length === 0) return plan;
  pending.forEach((cleanup, index) => {
    const hk = housekeepers[index % housekeepers.length];
    const list = plan.get(hk.id) ?? [];
    list.push(cleanup.spaceId);
    plan.set(hk.id, list);
  });
  return plan;
}

export function RoomAllocationPage() {
  const { t } = useTranslation();
  const [activeHousekeeper, setActiveHousekeeper] = useState<string>("");
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set());

  const { data: users } = useUsers();
  const { data: spaces } = useSpaces();
  const { data: cleanups } = useCleanups();
  const assign = useAssignCleanups();
  const clear = useClearCleanups();

  const housekeepers = useMemo(
    () => (users ?? []).filter((u) => u.role === "housekeeper" && u.onDutyToday),
    [users],
  );

  const unassigned = useMemo(
    () => (cleanups ?? []).filter((c) => c.state === "pending" && !c.assigneeId),
    [cleanups],
  );

  const assignedCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cleanups ?? []) {
      if (c.assigneeId) counts.set(c.assigneeId, (counts.get(c.assigneeId) ?? 0) + 1);
    }
    return counts;
  }, [cleanups]);

  function toggleSpace(spaceId: string) {
    setSelectedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) next.delete(spaceId);
      else next.add(spaceId);
      return next;
    });
  }

  function assignSelected() {
    if (!activeHousekeeper || selectedSpaces.size === 0) return;
    assign.mutate(
      { spaceIds: [...selectedSpaces], assigneeId: activeHousekeeper },
      { onSuccess: () => setSelectedSpaces(new Set()) },
    );
  }

  function autoAssign() {
    const plan = planAutoAssign(unassigned, housekeepers);
    for (const [assigneeId, spaceIds] of plan) {
      assign.mutate({ spaceIds, assigneeId });
    }
    setSelectedSpaces(new Set());
  }

  return (
    <div>
      <PageHeader
        title={t("allocation.title")}
        description={t("allocation.description")}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={autoAssign}
              disabled={unassigned.length === 0 || housekeepers.length === 0}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("allocation.autoAssign")}
            </button>
            <button
              onClick={() => clear.mutate()}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-canvas"
            >
              {t("allocation.reset")}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Card className="p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("allocation.onDuty")}
          </h3>
          {housekeepers.length > 0 ? (
            <ul className="space-y-1">
              {housekeepers.map((hk) => {
                const active = hk.id === activeHousekeeper;
                return (
                  <li key={hk.id}>
                    <button
                      onClick={() => setActiveHousekeeper(hk.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-brand-soft text-brand"
                          : "text-ink-soft hover:bg-canvas",
                      )}
                    >
                      <span className="font-medium">{hk.name}</span>
                      <span className="text-xs text-ink-faint">
                        {assignedCount.get(hk.id) ?? 0}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">{t("allocation.noOnDuty")}</p>
          )}
          <button
            onClick={assignSelected}
            disabled={!activeHousekeeper || selectedSpaces.size === 0}
            className="mt-4 w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedSpaces.size > 0
              ? t("allocation.assignCount", { count: selectedSpaces.size })
              : t("allocation.assignSelected")}
          </button>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("allocation.pending", { count: unassigned.length })}
          </h3>
          {unassigned.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {unassigned.map((cleanup) => {
                const selected = selectedSpaces.has(cleanup.spaceId);
                return (
                  <button
                    key={cleanup.id}
                    onClick={() => toggleSpace(cleanup.spaceId)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line bg-surface text-ink-soft hover:border-brand",
                    )}
                  >
                    {spaceLabel(spaces ?? [], cleanup.spaceId)}
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState message={t("allocation.allAssigned")} />
          )}
        </Card>
      </div>
    </div>
  );
}
