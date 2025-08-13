import React, { useMemo, useState, useEffect, useRef } from "react";
import { Search, MoreVertical, Smile, Paperclip, Mic, Send, ChevronLeft, Phone, Video, Check, CheckCheck } from "lucide-react";

/**
 * WhatsApp Web UI (Close Approximation)
 * - Pure React + TailwindCSS
 * - Responsive: mobile shows either chat list or conversation
 * - Message bubbles, ticks, timestamps, input bar
 * - Search & simple filtering in chat list
 * - Clean, production-ready structure you can wire to your backend
 *
 * Drop this file into your React app and ensure Tailwind is configured.
 * Default export <WhatsAppWebUI /> renders the whole layout.
 */

// --- Types ---
interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string; // "HH:MM"
  status?: "sent" | "delivered" | "read"; // for fromMe bubbles
}

interface ChatSummary {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unread?: number;
  online?: boolean;
}

interface Chat extends ChatSummary {
  messages: Message[];
}

// --- Demo Data ---
const demoChats: Chat[] = [
  {
    id: "1",
    name: "Akansha",
    avatar: "https://i.pravatar.cc/100?img=47",
    lastMessage: "See you at 7?",
    lastTime: "12:45",
    unread: 2,
    online: true,
    messages: [
      { id: "m1", text: "hey!", fromMe: false, time: "12:40" },
      { id: "m2", text: "movie tonight?", fromMe: false, time: "12:41" },
      { id: "m3", text: "Yep, 7 works.", fromMe: true, time: "12:44", status: "read" },
      { id: "m4", text: "See you at 7?", fromMe: false, time: "12:45" },
    ],
  },
  {
    id: "2",
    name: "Team Standup",
    avatar: "https://i.pravatar.cc/100?img=12",
    lastMessage: "Pushed hotfix",
    lastTime: "11:30",
    messages: [
      { id: "t1", text: "Daily in 5 mins", fromMe: false, time: "10:54" },
      { id: "t2", text: "Joining now", fromMe: true, time: "10:55", status: "delivered" },
      { id: "t3", text: "Pushed hotfix", fromMe: false, time: "11:30" },
    ],
  },
  {
    id: "3",
    name: "Mom",
    avatar: "https://i.pravatar.cc/100?img=5",
    lastMessage: "Call me beta",
    lastTime: "09:20",
    unread: 1,
    messages: [
      { id: "mm1", text: "Ate lunch?", fromMe: false, time: "09:18" },
      { id: "mm2", text: "Call me beta", fromMe: false, time: "09:20" },
    ],
  },
];

// --- Helpers ---
const StatusTicks: React.FC<{ status?: Message["status"] }>= ({ status }) => {
  if (!status) return null;
  if (status === "sent") return <Check className="h-4 w-4 opacity-60" />;
  if (status === "delivered") return <CheckCheck className="h-4 w-4 opacity-60" />;
  return <CheckCheck className="h-4 w-4" />; // read
};

const Avatar: React.FC<{ src?: string; name: string; online?: boolean }>= ({ src, name, online }) => {
  return (
    <div className="relative h-12 w-12 flex-shrink-0">
      <img
        src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
        alt={name}
        className="h-12 w-12 rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  );
};

const Divider: React.FC = () => (
  <div className="mx-4 my-1 h-px bg-black/5 dark:bg-white/10" />
);

// Subtle wallpaper-like bg for chat area
const ChatWallpaper: React.FC = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.035]"
    style={{
      backgroundImage:
        "radial-gradient(currentColor 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)",
      backgroundPosition: "0 0, 10px 10px",
      backgroundSize: "20px 20px",
      color: "#111827",
    }}
  />
);

// --- Main Component ---
const WhatsAppWebUI: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(demoChats);
  const [activeId, setActiveId] = useState<string>(demoChats[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [showListOnMobile, setShowListOnMobile] = useState(true); // list first on mobile
  const activeChat = useMemo(() => chats.find((c) => c.id === activeId)!, [chats, activeId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter((c) => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [query, chats]);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat.messages.length]);

  const selectChat = (id: string) => {
    setActiveId(id);
    setShowListOnMobile(false); // open chat on mobile
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: Math.random().toString(36).slice(2),
                  text,
                  fromMe: true,
                  time,
                  status: "sent",
                },
              ],
              lastMessage: text,
              lastTime: time,
            }
          : chat
      )
    );

    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f0f2f5] text-gray-900 antialiased dark:bg-[#0b141a] dark:text-gray-100">
      {/* Desktop container with centered app width like WhatsApp Web */}
      <div className="mx-auto flex h-full max-w-[1400px] gap-0 p-0 sm:p-4">
        {/* Sidebar (chat list) */}
        <aside
          className={[
            "flex h-full w-full max-w-full flex-col border-r border-black/10 bg-white dark:border-white/10 dark:bg-[#111b21] sm:max-w-[380px]",
            showListOnMobile ? "" : "hidden sm:flex",
          ].join(" ")}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name="You" src="https://i.pravatar.cc/100?img=2" online />
              <div>
                <div className="text-sm font-semibold">WhatsApp</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Web (Demo UI)</div>
              </div>
            </div>
            <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="More">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <Divider />

          {/* Search */}
          <div className="mx-3 my-2 flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 dark:bg-white/10">
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Chats */}
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-black/5 focus:bg-black/5 dark:hover:bg-white/10 dark:focus:bg-white/10 ${
                  c.id === activeId ? "bg-black/5 dark:bg-white/10" : ""
                }`}
                onClick={() => selectChat(c.id)}
              >
                <Avatar name={c.name} src={c.avatar} online={c.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[15px] font-medium">{c.name}</div>
                    <div className="ml-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{c.lastTime}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-gray-600 dark:text-gray-300">{c.lastMessage}</div>
                    {typeof c.unread === "number" && c.unread > 0 && (
                      <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation area */}
        <main
          className={[
            "relative flex h-full w-full flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a]",
            showListOnMobile ? "hidden sm:flex" : "flex",
          ].join(" ")}
        >
          {/* Chat header */}
          <div className="z-10 flex items-center justify-between gap-2 border-b border-black/10 bg-[#f0f2f5] px-3 py-2 dark:border-white/10 dark:bg-[#202c33]">
            <div className="flex items-center gap-3">
              <button className="sm:hidden" onClick={() => setShowListOnMobile(true)} aria-label="Back to chats">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <Avatar name={activeChat.name} src={activeChat.avatar} online={activeChat.online} />
              <div>
                <div className="-mb-0.5 text-[15px] font-medium">{activeChat.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {activeChat.online ? "online" : "last seen today at " + activeChat.lastTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Video">
                <Video className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Voice">
                <Phone className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="More">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto px-3 py-2 sm:px-6 sm:py-4">
            <ChatWallpaper />
            <div className="mx-auto flex max-w-3xl flex-col gap-1">
              {activeChat.messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative max-w-[82%] rounded-lg px-3 py-2 text-[15px] leading-snug shadow-sm sm:max-w-[70%] ${
                      m.fromMe
                        ? "bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-white"
                        : "bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100"
                    }`}
                  >
                    <span className="whitespace-pre-wrap break-words">{m.text}</span>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-[10px] opacity-60">{m.time}</span>
                      {m.fromMe && (
                        <span className="-mr-0.5 ml-0.5">
                          <StatusTicks status={m.status} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>

          {/* Composer */}
          <div className="z-10 flex items-end gap-2 border-t border-black/10 bg-[#f0f2f5] px-3 py-2 dark:border-white/10 dark:bg-[#202c33] sm:px-4">
            <button className="hidden rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 sm:inline-flex" aria-label="Emoji">
              <Smile className="h-6 w-6" />
            </button>
            <button className="hidden rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 sm:inline-flex" aria-label="Attach">
              <Paperclip className="h-6 w-6" />
            </button>

            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message"
              className="min-h-[44px] flex-1 rounded-xl bg-white px-3 py-2 text-[15px] outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500 dark:bg-[#2a3942]"
            />

            {draft.trim() ? (
              <button
                onClick={sendMessage}
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Send"
              >
                <Send className="h-6 w-6" />
              </button>
            ) : (
              <button className="inline-flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Mic">
                <Mic className="h-6 w-6" />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Small helper for dark mode demo */}
      <DarkModeToggle />
    </div>
  );
};

const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="fixed bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm shadow-md backdrop-blur hover:bg-white dark:bg-[#202c33]"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
};

export default WhatsAppWebUI;
