import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ModuleKey, Role, User } from "@/domain/types";
import { SidePanel } from "@/components/ui/SidePanel";
import { useUpdateRole } from "@/hooks/queries";
import { MODULE_KEYS } from "./modules";

interface Props {
  role: Role;
  users: User[];
  onClose: () => void;
}

export function RoleDetailPanel({ role, users, onClose }: Props) {
  const { t } = useTranslation();
  const update = useUpdateRole();
  const [modules, setModules] = useState<Set<ModuleKey>>(new Set(role.menuItems));

  function toggle(key: ModuleKey) {
    setModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function save() {
    const menuItems = MODULE_KEYS.filter((k) => modules.has(k));
    update.mutate({ id: role.id, menuItems }, { onSuccess: onClose });
  }

  const members = users.filter((u) => u.roleId === role.id);

  return (
    <SidePanel open title={role.title} subtitle={t("settings.roles.panel.subtitle")} onClose={onClose}>
      <div className="space-y-6">
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("settings.roles.panel.modules")}
          </h3>
          <p className="mb-3 text-sm text-ink-soft">{t("settings.roles.panel.moduleHint")}</p>
          <ul className="space-y-1.5">
            {MODULE_KEYS.map((key) => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-canvas">
                  <input
                    type="checkbox"
                    checked={modules.has(key)}
                    onChange={() => toggle(key)}
                    className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                  />
                  <span className="text-ink">{t(`settings.module.${key}`)}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("settings.roles.panel.users")} · {members.length}
          </h3>
          {members.length > 0 ? (
            <ul className="space-y-1 text-sm text-ink-soft">
              {members.map((u) => (
                <li key={u.id}>{u.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">{t("common.none")}</p>
          )}
        </section>

        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.save")}
        </button>
      </div>
    </SidePanel>
  );
}
