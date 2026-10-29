import { useTranslation } from "react-i18next";
import { Conversation, useChatStore } from "../chat/store";
import { IconPeople, initials, lastPreview } from "../chat/shared";
import { ScreenProps, StatusBar, TabBar } from "./shared";

function Row({
  conversation,
  photoLabel,
  onOpen,
}: {
  conversation: Conversation;
  photoLabel: string;
  onOpen: () => void;
}) {
  const last = conversation.messages[conversation.messages.length - 1];
  return (
    <button
      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left"
      onClick={onOpen}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[14px] font-semibold text-teal-700">
        {conversation.kind === "group" ? <IconPeople size={20} /> : initials(conversation.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-gray-900">
            {conversation.name}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">{last?.time}</span>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-[13px] text-gray-500">
            {lastPreview(conversation, photoLabel)}
          </span>
          {conversation.unread > 0 && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
              {conversation.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export function ChatListScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const conversations = useChatStore((s) => s.conversations);
  const setActive = useChatStore((s) => s.setActive);
  const markRead = useChatStore((s) => s.markRead);

  const open = (id: string) => {
    setActive(id);
    markRead(id);
    go("chatRoom");
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-end justify-between px-4 pb-3 pt-2">
          <h1 className="text-[30px] font-extrabold leading-none text-gray-900">
            {t("mobile.chat.title")}
          </h1>
          {/* The guest-relations screen lost its tab-bar slot to chat, so this
              button is its replacement entry point. */}
          <button
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600"
            onClick={() => go("guest")}
          >
            {t("mobile.tabs.guestRelations")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {conversations.map((c) => (
          <Row
            key={c.id}
            conversation={c}
            photoLabel={t("mobile.chat.photo")}
            onOpen={() => open(c.id)}
          />
        ))}
      </div>

      <TabBar go={go} active="chatList" />
    </div>
  );
}
