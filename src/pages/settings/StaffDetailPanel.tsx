import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Facility, ID, Role, User } from "@/domain/types";
import { SidePanel } from "@/components/ui/SidePanel";
import { Select } from "@/components/ui/Select";
import { useUpdateUser } from "@/hooks/queries";
import { cn } from "@/lib/cn";

interface Props {
  user: User;
  roles: Role[];
  facilities: Facility[];
  onClose: () => void;
}

export function StaffDetailPanel({ user, roles, facilities, onClose }: Props) {
  const { t } = useTranslation();
  const update = useUpdateUser();

  const [roleId, setRoleId] = useState<ID>(user.roleId);
  const [isActive, setIsActive] = useState(user.isActive);
  const [visible, setVisible] = useState<Set<ID>>(new Set(user.visibleFacilityIds));
  const [defaultFacilityId, setDefaultFacilityId] = useState<ID>(user.defaultFacilityId);

  function toggleFacility(id: ID) {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (!next.has(defaultFacilityId)) {
        setDefaultFacilityId([...next][0] ?? "");
      }
      return next;
    });
  }

  function save() {
    update.mutate(
      {
        id: user.id,
        patch: {
          roleId,
          isActive,
          visibleFacilityIds: [...visible],
          defaultFacilityId,
        },
      },
      { onSuccess: onClose },
    );
  }

  const visibleFacilities = facilities.filter((f) => visible.has(f.id));

  return (
    <SidePanel open title={user.name} subtitle={t("settings.staff.panel.subtitle")} onClose={onClose}>
      <div className="space-y-6">
        <p className="text-sm text-ink-soft">{user.username}</p>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("settings.staff.panel.role")}
          </h3>
          <Select
            value={roleId}
            onChange={setRoleId}
            options={roles.map((r) => ({ value: r.id, label: r.title }))}
          />
        </section>

        <section className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">
            {t("settings.staff.panel.active")}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isActive ? "bg-brand" : "bg-slate-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                isActive ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("settings.staff.panel.visibleFacilities")}
          </h3>
          <ul className="space-y-1.5">
            {facilities.map((f) => (
              <li key={f.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-canvas">
                  <input
                    type="checkbox"
                    checked={visible.has(f.id)}
                    onChange={() => toggleFacility(f.id)}
                    className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                  />
                  <span className="text-ink">{f.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("settings.staff.panel.defaultFacility")}
          </h3>
          <Select
            value={defaultFacilityId}
            onChange={setDefaultFacilityId}
            options={visibleFacilities.map((f) => ({ value: f.id, label: f.name }))}
          />
        </section>

        <button
          type="button"
          onClick={save}
          disabled={visible.size === 0 || update.isPending}
          className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("common.save")}
        </button>
      </div>
    </SidePanel>
  );
}
