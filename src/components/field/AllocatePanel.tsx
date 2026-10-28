import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Cleanup, User } from "@/domain/types";
import {
  useAssignCleanups,
  useCleanups,
  useClearCleanups,
  useSpaces,
  useUsers,
} from "@/hooks/queries";
import { cn } from "@/lib/cn";

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

export function AllocatePanel() {
  const { t } = useTranslation();
  const { data: users } = useUsers();
  const { data: spaces } = useSpaces();
  const { data: cleanups } = useCleanups();
  const assign = useAssignCleanups();
  const clear = useClearCleanups();

  const [activeHousekeeper, setActiveHousekeeper] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const spaceNumber = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of spaces ?? []) map.set(s.id, s.number);
    return map;
  }, [spaces]);

  function toggle(spaceId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) next.delete(spaceId);
      else next.add(spaceId);
      return next;
    });
  }

  function assignSelected() {
    if (!activeHousekeeper || selected.size === 0) return;
    assign.mutate(
      { spaceIds: [...selected], assigneeId: activeHousekeeper },
      { onSuccess: () => setSelected(new Set()) },
    );
  }

  function autoAssign() {
    const plan = planAutoAssign(unassigned, housekeepers);
    for (const [assigneeId, spaceIds] of plan) assign.mutate({ spaceIds, assigneeId });
    setSelected(new Set());
  }

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("field.allocate.onDuty")}
          </h3>
          <button
            type="button"
            onClick={() => clear.mutate()}
            className="text-xs font-medium text-ink-soft underline-offset-2 hover:underline"
          >
            {t("field.allocate.reset")}
          </button>
        </div>
        {housekeepers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {housekeepers.map((hk) => {
              const active = hk.id === activeHousekeeper;
              return (
                <button
                  key={hk.id}
                  type="button"
                  onClick={() => setActiveHousekeeper(hk.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-transparent bg-[#52c2b6] text-white"
                      : "border-line bg-surface text-ink-soft",
                  )}
                >
                  {hk.name}
                  <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-ink-faint")}>
                    {assignedCount.get(hk.id) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">{t("field.allocate.noOnDuty")}</p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("field.allocate.pending", { count: unassigned.length })}
          </h3>
          <button
            type="button"
            onClick={autoAssign}
            disabled={unassigned.length === 0 || housekeepers.length === 0}
            className="text-xs font-medium text-[#1f3b51] underline-offset-2 hover:underline disabled:opacity-40"
          >
            {t("field.allocate.auto")}
          </button>
        </div>
        {unassigned.length > 0 ? (
          <div className="grid grid-cols-4 gap-1.5">
            {unassigned.map((cleanup) => {
              const isSelected = selected.has(cleanup.spaceId);
              return (
                <button
                  key={cleanup.id}
                  type="button"
                  onClick={() => toggle(cleanup.spaceId)}
                  className={cn(
                    "rounded-md border py-2.5 text-sm font-semibold tabular-nums transition-colors",
                    isSelected
                      ? "border-transparent bg-[#52c2b6] text-white"
                      : "border-line bg-surface text-ink-soft",
                  )}
                >
                  {spaceNumber.get(cleanup.spaceId) ?? cleanup.spaceId}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-ink-faint">
            {t("field.allocate.allAssigned")}
          </p>
        )}
      </section>

      <div className="sticky bottom-0 -mx-3 border-t border-line bg-surface px-3 py-3">
        <button
          type="button"
          onClick={assignSelected}
          disabled={!activeHousekeeper || selected.size === 0}
          className="w-full rounded-lg bg-[#52c2b6] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected.size > 0
            ? t("field.allocate.assignCount", { count: selected.size })
            : t("field.allocate.assign")}
        </button>
      </div>
    </div>
  );
}
