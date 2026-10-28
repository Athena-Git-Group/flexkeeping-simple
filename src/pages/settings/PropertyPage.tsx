import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useAllSectors,
  useFacilities,
  useRealms,
  useSetFacilityActive,
  useSpaceCounts,
} from "@/hooks/queries";
import { cn } from "@/lib/cn";

export function PropertyPage() {
  const { t } = useTranslation();
  const { data: facilities, isLoading } = useFacilities();
  const { data: realms } = useRealms();
  const { data: sectors } = useAllSectors();
  const { data: spaceCounts } = useSpaceCounts();
  const setActive = useSetFacilityActive();

  const counts = spaceCounts ?? {};

  function sectorsOf(realmId: string) {
    return (sectors ?? []).filter((s) => s.realmId === realmId);
  }
  function realmsOf(facilityId: string) {
    return (realms ?? []).filter((r) => r.facilityId === facilityId);
  }

  return (
    <div>
      <PageHeader title={t("settings.property.title")} description={t("settings.property.description")} />

      {isLoading ? (
        <EmptyState message={t("settings.property.loading")} />
      ) : facilities && facilities.length > 0 ? (
        <div className="space-y-4">
          {facilities.map((facility) => {
            const facilityRealms = realmsOf(facility.id);
            return (
              <Card key={facility.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{facility.name}</h3>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {t("settings.property.realmCount", { count: facilityRealms.length })}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={facility.isActive}
                    onClick={() =>
                      setActive.mutate({ id: facility.id, isActive: !facility.isActive })
                    }
                    className="flex items-center gap-2 text-xs font-medium text-ink-soft"
                  >
                    {facility.isActive
                      ? t("settings.property.active")
                      : t("settings.property.inactive")}
                    <span
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        facility.isActive ? "bg-brand" : "bg-slate-300",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                          facility.isActive ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </span>
                  </button>
                </div>

                <ul className="mt-3 space-y-3 border-t border-line pt-3">
                  {facilityRealms.map((realm) => {
                    const realmSectors = sectorsOf(realm.id);
                    return (
                      <li key={realm.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink">{realm.name}</span>
                          <span className="text-xs text-ink-faint">
                            {t("settings.property.sectorCount", { count: realmSectors.length })}
                          </span>
                        </div>
                        <ul className="mt-1.5 space-y-1 pl-4">
                          {realmSectors.map((sector) => (
                            <li
                              key={sector.id}
                              className="flex items-center justify-between text-sm text-ink-soft"
                            >
                              <span>{sector.name}</span>
                              <span className="text-xs text-ink-faint">
                                {t("settings.property.spaceCount", {
                                  count: counts[sector.id] ?? 0,
                                })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState message={t("settings.property.empty")} />
      )}
    </div>
  );
}
