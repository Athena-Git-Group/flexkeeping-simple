import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CURRENT_USER, useChatStore } from "../chat/store";
import { FakePhoto, IconSend, OriginalText } from "../chat/shared";
import { IconBack, ScreenProps, StatusBar, TabBar } from "./shared";
import { ChatListScreen } from "./ChatListScreen";

export function ChatRoomScreen({ go }: ScreenProps) {
  const { t } = useTranslation();
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation?.id, conversation?.messages.length]);

  // The room screen is reachable without a selection (demo chip / stale state),
  // in which case falling back to the list beats rendering an empty shell.
  if (!conversation) return <ChatListScreen go={go} />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(conversation.id, draft);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-center gap-1 px-2 pb-2.5 pt-1">
          <button
            className="flex h-9 items-center gap-0.5 pr-1 text-teal-600"
            onClick={() => go("chatList")}
            aria-label={t("mobile.a11y.back")}
          >
            <IconBack />
            <span className="text-[14px] font-medium">{t("mobile.chat.title")}</span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-[15px] font-bold text-gray-900">
              {conversation.name}
            </div>
            {conversation.kind === "group" && (
              <div className="truncate text-[11px] text-gray-400">
                {t("mobile.chat.membersCount", { count: conversation.members.length })}
              </div>
            )}
          </div>
          {/* Spacer mirrors the back button so the title stays centered. */}
          <span className="w-[72px] shrink-0" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {conversation.messages.map((m) => {
          const mine = m.sender === CURRENT_USER;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%]">
                {!mine && (
                  <div className="mb-0.5 pl-1 text-[10px] font-medium text-gray-500">
                    {m.sender}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-1.5 text-[13px] leading-relaxed ${
                    mine
                      ? "rounded-br-md bg-teal-600 text-white"
                      : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {m.image ? (
                    <FakePhoto label={t("mobile.chat.photo")} compact />
                  ) : (
                    m.text
                  )}
                  <OriginalText message={m} mine={mine} ns="mobile.chat" />
                </div>
                <div
                  className={`mt-0.5 text-[9px] text-gray-400 ${
                    mine ? "pr-1 text-right" : "pl-1"
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={submit}
        className="flex shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-3 py-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("mobile.chat.inputPlaceholder")}
          className="h-9 min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
            draft.trim() ? "bg-teal-600 active:bg-teal-700" : "bg-gray-300"
          }`}
          aria-label={t("mobile.chat.send")}
        >
          <IconSend />
        </button>
      </form>

      <TabBar go={go} active="chatRoom" />
    </div>
  );
}
