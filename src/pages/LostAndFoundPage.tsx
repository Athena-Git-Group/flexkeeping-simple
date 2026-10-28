import { useTranslation } from "react-i18next";
import { useLabels } from "@/domain/labels";
import { lostAndFoundStateTone } from "@/domain/colors";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLostAndFound } from "@/hooks/queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LostAndFoundPage() {
  const { t } = useTranslation();
  const labels = useLabels();
  const { data: items, isLoading } = useLostAndFound();

  return (
    <div>
      <PageHeader
        title={t("lostFound.title")}
        description={t("lostFound.description")}
      />
      {isLoading ? (
        <EmptyState message={t("lostFound.loading")} />
      ) : items && items.length > 0 ? (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-medium">{t("lostFound.col.item")}</th>
                <th className="px-4 py-2.5 font-medium">{t("lostFound.col.category")}</th>
                <th className="px-4 py-2.5 font-medium">{t("lostFound.col.storage")}</th>
                <th className="px-4 py-2.5 font-medium">{t("lostFound.col.found")}</th>
                <th className="px-4 py-2.5 font-medium">{t("lostFound.col.state")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-canvas">
                  <td className="px-4 py-2.5 font-medium text-ink">{item.title}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{item.category}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{item.storageLocation ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{formatDate(item.foundAt)}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      label={labels.lostAndFoundState[item.state]}
                      className={lostAndFoundStateTone[item.state].badge}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState message={t("lostFound.noItems")} />
      )}
    </div>
  );
}
