import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/domain/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFacilities, useRoles, useStaff } from "@/hooks/queries";
import { StaffDetailPanel } from "./StaffDetailPanel";

export function StaffPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<User | null>(null);

  const { data: users, isLoading } = useStaff();
  const { data: roles } = useRoles();
  const { data: facilities } = useFacilities();

  function roleTitle(roleId: string): string {
    return roles?.find((r) => r.id === roleId)?.title ?? "—";
  }

  return (
    <div>
      <PageHeader title={t("settings.staff.title")} description={t("settings.staff.description")} />

      {isLoading ? (
        <EmptyState message={t("settings.staff.loading")} />
      ) : users && users.length > 0 ? (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-medium">{t("settings.staff.col.name")}</th>
                <th className="px-4 py-2.5 font-medium">{t("settings.staff.col.username")}</th>
                <th className="px-4 py-2.5 font-medium">{t("settings.staff.col.role")}</th>
                <th className="px-4 py-2.5 font-medium">{t("settings.staff.col.active")}</th>
                <th className="px-4 py-2.5 font-medium">{t("settings.staff.col.facilities")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className="cursor-pointer hover:bg-canvas"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{u.username}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{roleTitle(u.roleId)}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      label={u.isActive ? t("settings.staff.active") : t("settings.staff.inactive")}
                      className={
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {t("settings.staff.facilityCount", { count: u.visibleFacilityIds.length })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState message={t("settings.staff.empty")} />
      )}

      {selected && roles && facilities ? (
        <StaffDetailPanel
          key={selected.id}
          user={selected}
          roles={roles}
          facilities={facilities}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
