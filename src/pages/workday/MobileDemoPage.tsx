import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileScreen } from "./mobile/shared";
import { LoginScreen } from "./mobile/LoginScreen";
import { AccountsScreen } from "./mobile/AccountsScreen";
import { RoomsScreen } from "./mobile/RoomsScreen";
import { RoomDetailScreen } from "./mobile/RoomDetailScreen";
import { AddRepairScreen } from "./mobile/AddRepairScreen";
import { InspectionScreen } from "./mobile/InspectionScreen";
import { GuestRelationsScreen } from "./mobile/GuestRelationsScreen";
import { ChatListScreen } from "./mobile/ChatListScreen";
import { ChatRoomScreen } from "./mobile/ChatRoomScreen";

const SCREENS: { id: MobileScreen; labelKey: string }[] = [
  { id: "login", labelKey: "mobile.demo.login" },
  { id: "accounts", labelKey: "mobile.demo.accounts" },
  { id: "rooms", labelKey: "mobile.demo.rooms" },
  { id: "roomDetail", labelKey: "mobile.demo.roomDetail" },
  { id: "addRepair", labelKey: "mobile.demo.addRepair" },
  { id: "inspection", labelKey: "mobile.demo.inspection" },
  { id: "guest", labelKey: "mobile.demo.guest" },
  { id: "chatList", labelKey: "mobile.demo.chat" },
];

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh-TW", label: "繁中" },
  { code: "ja", label: "日本語" },
];

export function MobileDemoPage() {
  const [screen, setScreen] = useState<MobileScreen>("login");
  const { t, i18n } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#2A2E33] py-8">
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              screen === s.id
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={() => setScreen(s.id)}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1 rounded-full bg-white/10 p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              i18n.resolvedLanguage === lang.code
                ? "bg-white text-gray-900"
                : "text-white/70 hover:bg-white/20 hover:text-white"
            }`}
            onClick={() => void i18n.changeLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div
        className="overflow-hidden rounded-[48px] border-[10px] border-black bg-white shadow-2xl"
        style={{ width: 390, height: 844 }}
      >
        <div className="h-full w-full overflow-hidden">
          {screen === "login" && <LoginScreen go={setScreen} />}
          {screen === "accounts" && <AccountsScreen go={setScreen} />}
          {screen === "rooms" && <RoomsScreen go={setScreen} />}
          {screen === "roomDetail" && <RoomDetailScreen go={setScreen} />}
          {screen === "addRepair" && <AddRepairScreen go={setScreen} />}
          {screen === "inspection" && <InspectionScreen go={setScreen} />}
          {screen === "guest" && <GuestRelationsScreen go={setScreen} />}
          {screen === "chatList" && <ChatListScreen go={setScreen} />}
          {screen === "chatRoom" && <ChatRoomScreen go={setScreen} />}
        </div>
      </div>
    </div>
  );
}
