import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLabels } from "@/domain/labels";
import { assignmentStateTone, priorityTone } from "@/domain/colors";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useAssignments, useSpaces } from "@/hooks/queries";

const OPEN_STATES = new Set(["submitted", "fixed", "on_hold", "standby"]);

export function DashboardPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: spaces } = useSpaces();
  const { data: assignments } = useAssignments();

  const stats = useMemo(() => {
    const dirty = (spaces ?? []).filter((s) => s.cleanliness === "dirty").length;
    const awaiting = (spaces ?? []).filter(
      (s) => s.cleanliness === "awaiting_inspection",
    ).length;
    const open = (assignments ?? []).filter((a) => OPEN_STATES.has(a.state)).length;
    const urgent = (assignments ?? []).filter(
      (a) => a.priority === "urgent" && OPEN_STATES.has(a.state),
    ).length;
    return { dirty, awaiting, open, urgent };
  }, [spaces, assignments]);

  const openAssignments = useMemo(
    () => (assignments ?? []).filter((a) => OPEN_STATES.has(a.state)).slice(0, 6),
    [assignments],
  );

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.stat.dirtyRooms")}
          value={stats.dirty}
          accentClassName="bg-rose-500"
        />
        <StatCard
          label={t("dashboard.stat.awaitingInspection")}
          value={stats.awaiting}
          accentClassName="bg-amber-500"
        />
        <StatCard
          label={t("dashboard.stat.openTasks")}
          value={stats.open}
          accentClassName="bg-sky-500"
        />
        <StatCard
          label={t("dashboard.stat.urgentOpen")}
          value={stats.urgent}
          accentClassName="bg-rose-600"
        />
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{t("dashboard.openWorkItems")}</h2>
        </div>
        {openAssignments.length > 0 ? (
          <ul className="divide-y divide-line">
            {openAssignments.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{a.title}</p>
                  <p className="text-xs text-ink-faint">{labels.assignmentType[a.type]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={labels.priority[a.priority]}
                    className={priorityTone[a.priority].badge}
                    dotClassName={priorityTone[a.priority].dot}
                  />
                  <Badge
                    label={labels.assignmentState[a.state]}
                    className={assignmentStateTone[a.state].badge}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState message={t("dashboard.noOpenWorkItems")} />
          </div>
        )}
      </Card>
    </div>
  );
}
