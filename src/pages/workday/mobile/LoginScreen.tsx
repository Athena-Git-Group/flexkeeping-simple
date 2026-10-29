import { useTranslation } from "react-i18next";
import {
  IconBack,
  IconEyeSlash,
  IconFaceId,
  NAVY,
  ScreenProps,
  StatusBar,
} from "./shared";

export function LoginScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
        <button
          className="mt-1 -ml-2 flex h-9 w-9 items-center justify-center text-gray-700"
          onClick={() => go("accounts")}
          aria-label={t("mobile.a11y.back")}
        >
          <IconBack />
        </button>

        <h1 className="mt-4 text-[34px] font-extrabold leading-tight text-gray-900">
          {t("mobile.login.welcome")}
        </h1>
        <p className="text-[17px] text-gray-400">{t("mobile.login.toApp")}</p>

        <label className="mt-8 text-[13px] font-semibold text-gray-700">
          {t("mobile.login.emailOrUsername")}
        </label>
        <input
          className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-teal-500"
          defaultValue="shelagh.blakely@tmsdemo.com"
        />

        <label className="mt-5 text-[13px] font-semibold text-gray-700">
          {t("mobile.login.password")}
        </label>
        <div className="relative mt-1.5">
          <input
            type="password"
            placeholder={t("mobile.login.passwordPlaceholder")}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-[15px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-teal-500"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <IconEyeSlash />
          </span>
        </div>

        <button
          className="mt-7 w-full rounded-2xl bg-teal-600 py-3.5 text-[16px] font-semibold text-white active:bg-teal-700"
          onClick={() => go("rooms")}
        >
          {t("mobile.login.signIn")}
        </button>
        <button className="mt-3 w-full rounded-2xl border border-gray-300 bg-white py-3.5 text-[16px] font-semibold text-gray-800">
          {t("mobile.login.sso")}
        </button>

        <button className="mx-auto mt-6 flex items-center gap-1.5 text-[14px] text-gray-500 underline underline-offset-2">
          <IconFaceId />
          {t("mobile.login.faceId")}
        </button>

        <div className="mt-auto pt-10 text-center">
          <div className="text-[20px] font-extrabold" style={{ color: NAVY }}>
            tms-web.
          </div>
          <div className="mt-1 text-[10px] text-gray-400">
            {t("mobile.login.version", { version: "3.6.0-production" })}
          </div>
        </div>
      </div>
    </div>
  );
}
