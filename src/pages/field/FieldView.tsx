import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Cleanup, ID, Space } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { cleanupStateTone } from "@/domain/colors";
import { FIELD_COLORS } from "@/domain/fieldStatus";
import { Badge } from "@/components/ui/Badge";
import { FieldRoomTile } from "@/components/field/FieldRoomTile";
import { RoomStatusSheet } from "@/components/field/RoomStatusSheet";
import { NewAssignmentSheet } from "@/components/field/NewAssignmentSheet";
import { InspectPanel } from "@/components/field/InspectPanel";
import { AllocatePanel } from "@/components/field/AllocatePanel";
import {
  useAssignments,
  useCleanups,
  useCleanupsByAssignee,
  useSectors,
  useSpaces,
  useUsers,
} from "@/hooks/queries";
import { cn } from "@/lib/cn";

type FieldTab = "status" | "tasks" | "inspect" | "allocate";
type Scope = "all" | "mine";

const TAB_TITLE: Record<FieldTab, string> = {
  status: "field.title",
  tasks: "field.tasks.title",
  inspect: "field.inspect.title",
  allocate: "field.allocate.title",
};

const NAV_ITEMS: { key: FieldTab; labelKey: string; icon: string }[] = [
  { key: "status", labelKey: "field.tab.status", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { key: "tasks", labelKey: "field.tab.tasks", icon: "M4 6h4v4H4zM10 7h10M4 14h4v4H4zM10 15h10" },
  { key: "inspect", labelKey: "field.tab.inspect", icon: "M4 12l5 5L20 6" },
  { key: "allocate", labelKey: "field.tab.allocate", icon: "M9 7a3 3 0 100-6 3 3 0 000 6zM3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M17 11h6M20 8v6" },
];

export function FieldView() {
  const { t } = useTranslation();
  const labels = useLabels();

  const [tab, setTab] = useState<FieldTab>("status");
  const [scope, setScope] = useState<Scope>("all");
  const [activeSectorId, setActiveSectorId] = useState<string>("");
  const [selected, setSelected] = useState<Space | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [prefillSpaceId, setPrefillSpaceId] = useState<ID | undefined>(undefined);
  const [justCreated, setJustCreated] = useState(false);

  const { data: users } = useUsers();
  const { data: sectors } = useSectors();
  const { data: spaces, isLoading } = useSpaces();
  const { data: cleanups } = useCleanups();
  const { data: reports } = useAssignments({ state: "submitted" });

  // No login: the field view acts as the first on-duty housekeeper of the facility.
  const currentUser = useMemo(
    () => (users ?? []).find((u) => u.role === "housekeeper") ?? null,
    [users],
  );

  const { data: myCleanups } = useCleanupsByAssignee(currentUser?.id);

  const cleanupBySpace = useMemo(() => {
    const map = new Map<string, Cleanup>();
    for (const c of cleanups ?? []) map.set(c.spaceId, c);
    return map;
  }, [cleanups]);

  const userName = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users ?? []) map.set(u.id, u.name);
    return map;
  }, [users]);

  const effectiveSector = activeSectorId || sectors?.[0]?.id || "";

  const floorSpaces = useMemo(() => {
    let rows = (spaces ?? []).filter((s) => s.sectorId === effectiveSector);
    if (scope === "mine" && currentUser) {
      rows = rows.filter((s) => cleanupBySpace.get(s.id)?.assigneeId === currentUser.id);
    }
    return rows;
  }, [spaces, effectiveSector, scope, currentUser, cleanupBySpace]);

  const recentReports = useMemo(
    () => [...(reports ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports],
  );

  // Re-resolve from live query data so an open sheet reflects status changes.
  const selectedSpace = useMemo(
    () => (selected ? (spaces ?? []).find((s) => s.id === selected.id) ?? selected : null),
    [selected, spaces],
  );

  const selectedSectorName =
    selectedSpace && sectors
      ? sectors.find((s) => s.id === selectedSpace.sectorId)?.name ?? ""
      : "";
  const selectedCleanup = selectedSpace ? cleanupBySpace.get(selectedSpace.id) : undefined;
  const selectedAssignee =
    selectedCleanup?.assigneeId != null
      ? userName.get(selectedCleanup.assigneeId)
      : undefined;

  function changeTab(next: FieldTab) {
    if (next !== "tasks") setJustCreated(false);
    setTab(next);
  }

  function openNew(spaceId?: ID) {
    setPrefillSpaceId(spaceId);
    setNewOpen(true);
  }

  function handleCreated() {
    setNewOpen(false);
    setJustCreated(true);
    setTab("tasks");
  }

  const showSectorBar = tab === "status" || tab === "inspect";

  return (
    <div className="flex min-h-screen justify-center bg-slate-200">
      <div
        className="relative flex h-screen w-full max-w-[400px] flex-col overflow-hidden"
        style={{ backgroundColor: FIELD_COLORS.background }}
      >
        <header className="shrink-0 px-4 pb-3 pt-4 text-white" style={{ backgroundColor: FIELD_COLORS.toolbar }}>
          <div className="flex items-baseline justify-between">
            <h1 className="text-lg font-semibold">{t(TAB_TITLE[tab])}</h1>
            {currentUser ? (
              <span className="text-xs text-white/70">
                {t("field.viewingAs", { name: currentUser.name })}
              </span>
            ) : null}
          </div>

          {tab === "status" ? (
            <div className="mt-3 inline-flex rounded-lg bg-white/10 p-0.5 text-sm">
              {(["all", "mine"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium transition-colors",
                    scope === value ? "bg-white text-ink" : "text-white/80",
                  )}
                >
                  {value === "all" ? t("field.scope.all") : t("field.scope.mine")}
                </button>
              ))}
            </div>
          ) : null}
        </header>

        {showSectorBar ? (
          <div className="shrink-0 overflow-x-auto border-b border-line bg-surface">
            <div className="flex">
              {(sectors ?? []).map((sector) => {
                const active = sector.id === effectiveSector;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => setActiveSectorId(sector.id)}
                    className={cn(
                      "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border-[#52c2b6] text-ink"
                        : "border-transparent text-ink-faint",
                    )}
                  >
                    {sector.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto p-3 pb-20">
          {tab === "status" ? (
            isLoading ? (
              <p className="py-10 text-center text-sm text-ink-faint">{t("field.loading")}</p>
            ) : floorSpaces.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5">
                {floorSpaces.map((space) => (
                  <FieldRoomTile key={space.id} space={space} onClick={setSelected} />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-ink-faint">
                {scope === "mine" ? t("field.emptyMine") : t("field.empty")}
              </p>
            )
          ) : tab === "tasks" ? (
            <div className="space-y-5">
              {justCreated ? (
                <div className="flex items-center justify-between rounded-lg bg-[#52c2b6]/15 px-3 py-2.5 text-sm text-[#1f3b51]">
                  <span className="font-medium">{t("field.new.created")}</span>
                  <button
                    type="button"
                    onClick={() => setJustCreated(false)}
                    aria-label={t("common.close")}
                    className="rounded-full p-0.5 text-[#1f3b51]/70"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : null}

              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {t("field.tasks.reports")}
                </h2>
                {recentReports.length > 0 ? (
                  <ul className="space-y-2">
                    {recentReports.map((report) => {
                      const space = report.spaceId
                        ? (spaces ?? []).find((s) => s.id === report.spaceId)
                        : undefined;
                      return (
                        <li
                          key={report.id}
                          className="rounded-lg border border-line bg-surface px-3 py-3 shadow-card"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-ink">{report.title}</span>
                            <Badge label={labels.priority[report.priority]} />
                          </div>
                          <div className="mt-1 text-xs text-ink-faint">
                            {labels.assignmentType[report.type]}
                            {space ? ` · ${t("field.tasks.roomPrefix", { number: space.number })}` : ""}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-ink-faint">{t("field.tasks.noReports")}</p>
                )}
              </section>

              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {t("field.tasks.title")}
                </h2>
                {(myCleanups ?? []).length > 0 ? (
                  <ul className="space-y-2">
                    {(myCleanups ?? []).map((cleanup) => {
                      const space = (spaces ?? []).find((s) => s.id === cleanup.spaceId);
                      return (
                        <li key={cleanup.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (space) {
                                setTab("status");
                                setActiveSectorId(space.sectorId);
                                setSelected(space);
                              }
                            }}
                            className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3 py-3 text-left shadow-card"
                          >
                            <span>
                              <span className="text-base font-semibold text-ink">
                                {space ? t("field.tasks.roomPrefix", { number: space.number }) : cleanup.spaceId}
                              </span>
                              <span className="ml-2 text-xs text-ink-faint">
                                {labels.cleanupType[cleanup.type]}
                              </span>
                            </span>
                            <Badge
                              label={labels.cleanupState[cleanup.state]}
                              className={cleanupStateTone[cleanup.state].badge}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-ink-faint">{t("field.tasks.empty")}</p>
                )}
              </section>
            </div>
          ) : tab === "inspect" ? (
            <InspectPanel sectorId={effectiveSector} />
          ) : (
            <AllocatePanel />
          )}
        </main>

        <button
          type="button"
          onClick={() => openNew()}
          aria-label={t("field.fab")}
          className="absolute bottom-20 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: FIELD_COLORS.action }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="shrink-0 border-t border-line bg-surface">
          <div className="flex">
            {NAV_ITEMS.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeTab(item.key)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium",
                    active ? "text-[#1f3b51]" : "text-ink-faint",
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </nav>

        <RoomStatusSheet
          space={selectedSpace}
          sectorName={selectedSectorName}
          cleanup={selectedCleanup}
          assigneeName={selectedAssignee}
          onClose={() => setSelected(null)}
          onReport={(spaceId) => {
            setSelected(null);
            openNew(spaceId);
          }}
        />

        <NewAssignmentSheet
          open={newOpen}
          prefillSpaceId={prefillSpaceId}
          onClose={() => setNewOpen(false)}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}
