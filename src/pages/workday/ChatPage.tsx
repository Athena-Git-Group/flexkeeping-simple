import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { IconCross, IconSearch } from "@/pages/workday/icons";
import { housekeepers } from "@/pages/workday/data";
import { CURRENT_USER, Conversation, useChatStore } from "@/pages/workday/chat/store";
import {
  FakePhoto,
  IconDotsVertical,
  IconPaperclip,
  IconPeople,
  IconSend,
  OriginalText,
  initials,
  lastPreview,
} from "@/pages/workday/chat/shared";

const tKey = (suffix: string) => `workday.chat.${suffix}`;

function Avatar({ conversation }: { conversation: Conversation }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[13px] font-semibold text-teal-700">
      {conversation.kind === "group" ? <IconPeople size={18} /> : initials(conversation.name)}
    </span>
  );
}

function ConversationRow({
  conversation,
  selected,
  onSelect,
  photoLabel,
}: {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
  photoLabel: string;
}) {
  const last = conversation.messages[conversation.messages.length - 1];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left",
        selected ? "bg-teal-50" : "hover:bg-gray-50",
      )}
    >
      <Avatar conversation={conversation} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              selected ? "font-semibold text-teal-700" : "font-medium text-gray-800",
            )}
          >
            {conversation.name}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">{last?.time}</span>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-gray-500">
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

function NewChatModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { t } = useTranslation();
  const createConversation = useChatStore((s) => s.createConversation);
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [picked, setPicked] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const togglePick = (name: string) =>
    setPicked((cur) =>
      cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name],
    );

  const canCreate =
    mode === "dm" ? picked.length === 1 : picked.length >= 2 && groupName.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    const id =
      mode === "dm"
        ? createConversation("dm", picked[0], picked)
        : createConversation("group", groupName.trim(), picked);
    onCreated(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">{t(tKey("newChat"))}</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
            aria-label={t(tKey("cancel"))}
          >
            <IconCross size={16} />
          </button>
        </div>

        <div className="mt-3 flex rounded-md bg-gray-100 p-0.5 text-xs font-medium">
          {(["dm", "group"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={cn(
                "flex-1 rounded py-1.5",
                mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-400",
              )}
              onClick={() => {
                setMode(m);
                setPicked([]);
              }}
            >
              {t(tKey(m === "dm" ? "modalDm" : "modalGroup"))}
            </button>
          ))}
        </div>

        {mode === "group" && (
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t(tKey("groupNamePlaceholder"))}
            className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500"
          />
        )}

        <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-gray-200">
          {housekeepers.map((name) => {
            const checked = picked.includes(name);
            return (
              <button
                key={name}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0",
                  checked ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50",
                )}
                onClick={() =>
                  mode === "dm" ? setPicked([name]) : togglePick(name)
                }
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                    mode === "dm" ? "rounded-full" : "",
                    checked ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
                {name}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            onClick={onClose}
          >
            {t(tKey("cancel"))}
          </button>
          <button
            type="button"
            disabled={!canCreate}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-bold text-white",
              canCreate ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-300",
            )}
            onClick={create}
          >
            {t(tKey("create"))}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessagePane({
  conversation,
  onToast,
}: {
  conversation: Conversation;
  onToast: (text: string) => void;
}) {
  const { t } = useTranslation();
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.id, conversation.messages.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(conversation.id, draft);
    setDraft("");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-3">
          <Avatar conversation={conversation} />
          <div>
            <div className="text-sm font-semibold text-gray-800">{conversation.name}</div>
            <div className="text-[11px] text-gray-400">
              {conversation.kind === "group"
                ? `${t(tKey("membersCount"), { count: conversation.members.length })} · ${conversation.members.join("、")}`
                : conversation.name}
            </div>
          </div>
        </div>
        <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="More">
          <IconDotsVertical />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {conversation.messages.map((m) => {
          const mine = m.sender === CURRENT_USER;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className="max-w-[70%]">
                {!mine && (
                  <div className="mb-0.5 pl-1 text-[11px] font-medium text-gray-500">
                    {m.sender}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-teal-600 text-white"
                      : "rounded-bl-md border border-gray-200 bg-white text-gray-800",
                  )}
                >
                  {m.image ? <FakePhoto label={t(tKey("photo"))} /> : m.text}
                  <OriginalText message={m} mine={mine} ns="workday.chat" />
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[10px] text-gray-400",
                    mine ? "pr-1 text-right" : "pl-1",
                  )}
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
        className="flex shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-4 py-3"
      >
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Attach"
          onClick={() => onToast(t(tKey("attachNotSupported")))}
        >
          <IconPaperclip />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t(tKey("inputPlaceholder"))}
          className="h-9 min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-teal-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-white",
            draft.trim() ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-300",
          )}
          aria-label={t(tKey("send"))}
        >
          <IconSend />
        </button>
      </form>
    </div>
  );
}

export function ChatPage() {
  const { t } = useTranslation();
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);
  const markRead = useChatStore((s) => s.markRead);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const showToast = (text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, query]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const select = (id: string) => {
    setActive(id);
    markRead(id);
  };

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <h1 className="text-base font-bold text-gray-800">{t(tKey("title"))}</h1>
          <button
            type="button"
            className="rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
            onClick={() => setModalOpen(true)}
          >
            + {t(tKey("newChat"))}
          </button>
        </div>
        <div className="shrink-0 border-b border-gray-100 p-3">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
            <IconSearch size={14} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(tKey("searchPlaceholder"))}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {visible.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              selected={c.id === activeId}
              onSelect={() => select(c.id)}
              photoLabel={t(tKey("photo"))}
            />
          ))}
        </div>
      </div>

      {active ? (
        <MessagePane conversation={active} onToast={showToast} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          {t(tKey("emptySelect"))}
        </div>
      )}

      {modalOpen && (
        <NewChatModal onClose={() => setModalOpen(false)} onCreated={select} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-800 px-4 py-2 text-xs text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
