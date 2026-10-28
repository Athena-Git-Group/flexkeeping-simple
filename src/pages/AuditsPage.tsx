import { useTranslation } from "react-i18next";
import { useLabels } from "@/domain/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuestionnaires } from "@/hooks/queries";

export function AuditsPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: questionnaires, isLoading } = useQuestionnaires();

  return (
    <div>
      <PageHeader
        title={t("audits.title")}
        description={t("audits.description")}
      />
      {isLoading ? (
        <EmptyState message={t("audits.loading")} />
      ) : questionnaires && questionnaires.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {questionnaires.map((q) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-semibold text-ink">{q.title}</h2>
                <Badge
                  label={t("audits.openCount", { count: q.openAuditCount })}
                  className={
                    q.openAuditCount > 0
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }
                />
              </div>
              <ul className="mt-3 space-y-1.5">
                {q.questions.map((question) => (
                  <li
                    key={question.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-ink-soft">{question.prompt}</span>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {labels.questionType[question.type]}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={t("audits.noQuestionnaires")} />
      )}
    </div>
  );
}
