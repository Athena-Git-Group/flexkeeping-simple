import { useTranslation } from "react-i18next";
import { useLabels } from "@/domain/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFeedback } from "@/hooks/queries";
import { cn } from "@/lib/cn";

export function GuestRelationsPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: feedback, isLoading } = useFeedback();

  return (
    <div>
      <PageHeader
        title={t("guestRelations.title")}
        description={t("guestRelations.description")}
      />
      {isLoading ? (
        <EmptyState message={t("guestRelations.loading")} />
      ) : feedback && feedback.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {feedback.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      label={labels.feedbackType[item.type]}
                      className={
                        item.type === "complaint"
                          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      }
                    />
                    <span className="text-xs text-ink-faint">
                      {item.responsibleDepartment}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{item.title}</p>
                </div>
                <Badge
                  label={item.resolved ? t("common.resolved") : t("common.open")}
                  className={
                    item.resolved
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }
                />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-ink-faint">{t("guestRelations.satisfaction")}</dt>
                  <dd className="text-ink">{labels.satisfaction[item.satisfaction]}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-faint">{t("guestRelations.severity")}</dt>
                  <dd className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={cn(
                          "h-1.5 w-4 rounded-full",
                          n <= item.severity ? "bg-rose-500" : "bg-slate-200",
                        )}
                      />
                    ))}
                  </dd>
                </div>
              </dl>

              {item.compensationItems.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.compensationItems.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-canvas px-2 py-0.5 text-xs text-ink-soft"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={t("guestRelations.noFeedback")} />
      )}
    </div>
  );
}
