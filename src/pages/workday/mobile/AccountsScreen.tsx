import { useTranslation } from "react-i18next";
import { IconBack, IconClose, IconPlus, ScreenProps, StatusBar } from "./shared";

const ACCOUNTS = [
  "kristine.jodie@tmsdemo.com",
  "serena.virgil@tmsdemo.com",
  "shelagh.blakely@tmsdemo.com",
  "aaron.kasimira@tmsdemo.com",
  "till.christoph@tmsdemo.com",
];

export function AccountsScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
        <button
          className="mt-1 -ml-1 flex h-9 w-9 items-center justify-center text-gray-700"
          onClick={() => go("login")}
          aria-label={t("mobile.a11y.back")}
        >
          <IconBack />
        </button>

        <h1 className="mt-3 text-[28px] font-extrabold leading-tight text-gray-900">
          {t("mobile.accounts.title")}
        </h1>

        <div className="mt-6 space-y-3">
          {ACCOUNTS.map((email) => (
            <button
              key={email}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm active:bg-gray-50"
              onClick={() => go("login")}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[15px] font-bold text-teal-700">
                {email[0].toUpperCase()}
              </span>
              <span className="flex-1 truncate text-[14px] text-gray-800">{email}</span>
              <span className="text-gray-400">
                <IconClose size={14} />
              </span>
            </button>
          ))}

          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-4 py-4 text-[14px] font-medium text-gray-400">
            <IconPlus size={16} />
            {t("mobile.accounts.another")}
          </button>
        </div>
      </div>
    </div>
  );
}
