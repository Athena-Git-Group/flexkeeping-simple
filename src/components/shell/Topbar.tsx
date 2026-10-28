import { useTranslation } from "react-i18next";
import { useSession } from "@/app/session";
import { useFacilities } from "@/hooks/queries";
import { Select } from "@/components/ui/Select";
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function Topbar() {
  const { t, i18n } = useTranslation();
  const facilityId = useSession((s) => s.facilityId);
  const currentUserName = useSession((s) => s.currentUserName);
  const setFacility = useSession((s) => s.setFacility);
  const { data: facilities } = useFacilities();

  const initials = currentUserName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  function changeLanguage(lng: string) {
    void i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {t("topbar.facility")}
        </span>
        <Select
          value={facilityId}
          onChange={setFacility}
          options={(facilities ?? []).map((f) => ({ value: f.id, label: f.name }))}
        />
      </div>
      <div className="flex items-center gap-3">
        <Select
          value={i18n.resolvedLanguage ?? "zh-TW"}
          onChange={changeLanguage}
          options={SUPPORTED_LANGUAGES.map((lng) => ({
            value: lng,
            label: t(`topbar.lang.${lng}`),
          }))}
        />
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{currentUserName}</p>
          <p className="text-xs text-ink-faint">{t("topbar.role")}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
          {initials}
        </span>
      </div>
    </header>
  );
}
