import { useTranslation } from "react-i18next";
import type { Assignment, AssignmentState } from "@/domain/types";
import { useLabels } from "@/domain/labels";
import { assignmentStateTone, priorityTone } from "@/domain/colors";
import { Badge } from "@/components/ui/Badge";
import { SidePanel } from "@/components/ui/SidePanel";
import { Select } from "@/components/ui/Select";
import { useSetAssignmentState, useToggleTodo } from "@/hooks/queries";
import { cn } from "@/lib/cn";

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

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function AssignmentDetailPanel({
  assignment,
  onClose,
}: {
  assignment: Assignment | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const labels = useLabels();
  const setState = useSetAssignmentState();
  const toggleTodo = useToggleTodo();

  if (!assignment) return null;

  return (
    <SidePanel
      open
      title={assignment.title}
      subtitle={labels.assignmentType[assignment.type]}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge
            label={labels.assignmentState[assignment.state]}
            className={assignmentStateTone[assignment.state].badge}
          />
          <Badge
            label={labels.priority[assignment.priority]}
            className={priorityTone[assignment.priority].badge}
          />
          {assignment.reportedByGuest ? (
            <Badge label={t("tasks.detail.reportedByGuest")} />
          ) : null}
          {assignment.isOutsourced ? <Badge label={t("tasks.detail.outsourced")} /> : null}
          {assignment.isRepeating ? <Badge label={t("tasks.detail.repeating")} /> : null}
        </div>

        {assignment.description ? (
          <p className="text-sm text-ink-soft">{assignment.description}</p>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-faint">{t("tasks.detail.due")}</dt>
            <dd className="text-ink">{formatDate(assignment.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">{t("tasks.detail.created")}</dt>
            <dd className="text-ink">{formatDate(assignment.createdAt)}</dd>
          </div>
        </dl>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("tasks.detail.changeState")}
          </h3>
          <Select
            value={assignment.state}
            onChange={(value) =>
              setState.mutate({ id: assignment.id, state: value as AssignmentState })
            }
            options={STATE_VALUES.map((v) => ({ value: v, label: labels.assignmentState[v] }))}
          />
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("tasks.detail.todo")}
          </h3>
          {assignment.todoItems.length > 0 ? (
            <ul className="space-y-1.5">
              {assignment.todoItems.map((todo) => (
                <li key={todo.id}>
                  <button
                    onClick={() =>
                      toggleTodo.mutate({ assignmentId: assignment.id, todoId: todo.id })
                    }
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-canvas"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        todo.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-line",
                      )}
                    >
                      {todo.done ? "✓" : ""}
                    </span>
                    <span className={todo.done ? "text-ink-faint line-through" : "text-ink"}>
                      {todo.text}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">{t("tasks.detail.noTodo")}</p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("tasks.detail.attachments")}
          </h3>
          {assignment.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignment.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-line text-[10px] text-ink-faint"
                >
                  <span className="text-lg">{att.kind === "video" ? "▶" : "▣"}</span>
                  {t(`tasks.detail.kind.${att.kind}`)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">{t("tasks.detail.noAttachments")}</p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("tasks.detail.comments")}
          </h3>
          {assignment.comments.length > 0 ? (
            <ul className="space-y-2">
              {assignment.comments.map((comment) => (
                <li key={comment.id} className="rounded-lg bg-canvas px-3 py-2 text-sm">
                  <p className="text-ink">{comment.text}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {formatDate(comment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">{t("tasks.detail.noComments")}</p>
          )}
        </section>
      </div>
    </SidePanel>
  );
}
