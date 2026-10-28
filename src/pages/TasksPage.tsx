import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  Assignment,
  AssignmentState,
  AssignmentType,
  Priority,
  User,
} from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { assignmentStateTone, priorityTone } from "@/domain/colors";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AssignmentDetailPanel } from "@/components/AssignmentDetailPanel";
import { useAssignments, useUsers } from "@/hooks/queries";

const TYPE_VALUES: AssignmentType[] = [
  "task",
  "repair",
  "issue",
  "flaw_cleaning",
  "room_order",
];
const STATE_VALUES: AssignmentState[] = [
  "submitted",
  "fixed",
  "approved",
  "done",
  "on_hold",
  "standby",
  "archived",
  "cancelled",
];
const PRIORITY_VALUES: Priority[] = ["low", "medium", "high", "urgent"];

function assigneeName(
  users: User[] | undefined,
  unassignedLabel: string,
  id?: string,
): string {
  if (!id) return unassignedLabel;
  return users?.find((u) => u.id === id)?.name ?? unassignedLabel;
}

export function TasksPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<Assignment | null>(null);

  const { data: users } = useUsers();
  const { data: assignments, isLoading } = useAssignments({
    type: (type || undefined) as AssignmentType | undefined,
    state: (state || undefined) as AssignmentState | undefined,
    priority: (priority || undefined) as Priority | undefined,
  });

  return (
    <div>
      <PageHeader
        title={t("tasks.title")}
        description={t("tasks.description")}
        actions={
          <div className="flex items-end gap-2">
            <Select
              label={t("tasks.type")}
              value={type}
              onChange={setType}
              placeholder={t("tasks.allTypes")}
              options={TYPE_VALUES.map((v) => ({ value: v, label: labels.assignmentType[v] }))}
            />
            <Select
              label={t("tasks.state")}
              value={state}
              onChange={setState}
              placeholder={t("tasks.allStates")}
              options={STATE_VALUES.map((v) => ({ value: v, label: labels.assignmentState[v] }))}
            />
            <Select
              label={t("tasks.priority")}
              value={priority}
              onChange={setPriority}
              placeholder={t("tasks.allPriorities")}
              options={PRIORITY_VALUES.map((v) => ({ value: v, label: labels.priority[v] }))}
            />
          </div>
        }
      />

      {isLoading ? (
        <EmptyState message={t("tasks.loading")} />
      ) : assignments && assignments.length > 0 ? (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-medium">{t("tasks.col.title")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tasks.col.type")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tasks.col.state")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tasks.col.priority")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tasks.col.assignee")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {assignments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="cursor-pointer hover:bg-canvas"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{a.title}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{labels.assignmentType[a.type]}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      label={labels.assignmentState[a.state]}
                      className={assignmentStateTone[a.state].badge}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      label={labels.priority[a.priority]}
                      className={priorityTone[a.priority].badge}
                      dotClassName={priorityTone[a.priority].dot}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {assigneeName(users, t("tasks.unassigned"), a.assigneeId)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState message={t("tasks.noMatch")} />
      )}

      <AssignmentDetailPanel assignment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
