import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Role } from "@/domain/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCreateRole, useRoles, useStaff } from "@/hooks/queries";
import { RoleDetailPanel } from "./RoleDetailPanel";

export function RolesPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: roles, isLoading } = useRoles();
  const { data: users } = useStaff();
  const createRole = useCreateRole();

  function userCount(roleId: string): number {
    return (users ?? []).filter((u) => u.roleId === roleId).length;
  }

  function addRole() {
    createRole.mutate(
      { title: t("settings.roles.newRoleTitle") },
      { onSuccess: (role: Role) => setSelectedId(role.id) },
    );
  }

  const selected = roles?.find((r) => r.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        title={t("settings.roles.title")}
        description={t("settings.roles.description")}
        actions={
          <button
            type="button"
            onClick={addRole}
            disabled={createRole.isPending}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("settings.roles.newRole")}
          </button>
        }
      />

      {isLoading ? (
        <EmptyState message={t("settings.roles.loading")} />
      ) : roles && roles.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="p-4">
              <button
                type="button"
                onClick={() => setSelectedId(role.id)}
                className="w-full text-left"
              >
                <h3 className="text-sm font-semibold text-ink">{role.title}</h3>
                <p className="mt-2 text-xs text-ink-soft">
                  {t("settings.roles.modulesCount", { count: role.menuItems.length })}
                </p>
                <p className="text-xs text-ink-faint">
                  {t("settings.roles.usersCount", { count: userCount(role.id) })}
                </p>
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={t("settings.roles.empty")} />
      )}

      {selected ? (
        <RoleDetailPanel
          key={selected.id}
          role={selected}
          users={users ?? []}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}
