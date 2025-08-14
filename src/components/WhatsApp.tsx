import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  ChevronLeft,
  Phone,
  Video,
  Check,
  CheckCheck,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { getUsers } from "@/BackendApi/ApiService";
import { getMessages } from "@/BackendApi/ApiService";
import { handleSendMessage } from "@/BackendApi/ApiService";
interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
}

interface ChatSummary {
  id: string; // here we'll store wa_id
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

const StatusTicks: React.FC<{ status?: Message["status"] }> = ({ status }) => {
  if (!status) return null;
  if (status === "sent") return <Check className="h-4 w-4 opacity-60" />;
  if (status === "delivered")
    return <CheckCheck className="h-4 w-4 opacity-60" />;
  return <CheckCheck className="h-4 w-4" />;
};

const Avatar: React.FC<{ src?: string; name: string; online?: boolean }> = ({
  src,
  name,
  online,
}) => (
  <div className="relative h-12 w-12 flex-shrink-0">
    <img
      src={
        src ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random`
      }
      alt={name}
      className="h-12 w-12 rounded-full object-cover"
    />
    {online && (
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
    )}
  </div>
);

const Divider = () => (
  <div className="mx-4 my-1 h-px bg-black/5 dark:bg-white/10" />
);

const ChatWallpaper = () => (
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

const WhatsAppWebUI: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch user list on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users:any = await getUsers() // endpoint returns deduplicated list
     console.log(users);

        const chatsFormatted: Chat[] = users.map((u:any) => ({
          id: u.wa_id,
          name: u.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            u.name
          )}&background=random`,
          lastMessage: u.text || "",
          lastTime: new Date(u.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          messages: [], // will be filled when user is clicked
        }));

        setChats(chatsFormatted);
        if (chatsFormatted.length > 0) {
          setActiveId(chatsFormatted[0].id);
          fetchMessages(chatsFormatted[0].id);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch messages by wa_id
  const fetchMessages = async (wa_id: string) => {
    try {
      const msgs = await getMessages(wa_id);
        console.log(msgs);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === wa_id
            ? {
                ...chat,
                messages: msgs.map((m:any) => ({
                  id: m._id,
                  text: m.text,
                  fromMe: m.direction === "outgoing",
                  time: new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  status: m.status,
                })),
              }
            : chat
        )
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeId)!,
    [chats, activeId]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [query, chats]);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat?.messages.length]);

  const selectChat = (id: string) => {
    setActiveId(id);
    setShowListOnMobile(false);
    fetchMessages(id);
  };

  const sendMessage = async() => {

    const text = draft.trim();
    if (!text || !activeId) return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);


  

const message = {
  name:activeChat.name,
  wa_id:activeId,
  text:text,
  status:"delivered",
  timestamp:Date.now(),
  direction:"outgoing"
}

await handleSendMessage(message);
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

  const onEmojiClick = (emojiData: any) => {
    setDraft((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!activeChat) return null; // no chats yet

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f0f2f5] text-gray-900 antialiased dark:bg-[#0b141a] dark:text-gray-100">
      <div className="mx-auto flex h-full max-w-[1400px] gap-0 p-0 sm:p-4">
        {/* Sidebar */}
        <aside
          className={[
            "flex h-full w-full max-w-full flex-col border-r border-black/10 bg-white dark:border-white/10 dark:bg-[#111b21] sm:max-w-[380px]",
            showListOnMobile ? "" : "hidden sm:flex",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="text-xl font-semibold">WhatsApp</div>
            </div>
            <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <Divider />
          <div className="mx-3 my-2 flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 dark:bg-white/10">
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>
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
                    <div className="truncate text-[15px] font-medium">
                      {c.name}
                    </div>
                    <div className="ml-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {c.lastTime}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-gray-600 dark:text-gray-300">
                      {c.lastMessage}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <main
          className={[
            "relative flex h-full w-full flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a]",
            showListOnMobile ? "hidden sm:flex" : "flex",
          ].join(" ")}
        >
          <div className="z-10 flex items-center justify-between gap-2 border-b border-black/10 bg-[#f0f2f5] px-3 py-2 dark:border-white/10 dark:bg-[#202c33]">
            <div className="flex items-center gap-3">
              <button
                className="sm:hidden"
                onClick={() => setShowListOnMobile(true)}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <Avatar
                name={activeChat.name}
                src={activeChat.avatar}
                online={activeChat.online}
              />
              <div>
                <div className="-mb-0.5 text-[15px] font-medium">
                  {activeChat.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {activeChat.online
                    ? "online"
                    : "last seen today at " + activeChat.lastTime}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5" />
              <Phone className="h-5 w-5" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto px-3 py-2 sm:px-6 sm:py-4">
            <ChatWallpaper />
            <div className="mx-auto flex max-w-3xl flex-col gap-1">
              {activeChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[82%] rounded-lg px-3 py-2 text-[15px] leading-snug shadow-sm sm:max-w-[70%] ${
                      m.fromMe
                        ? "bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-white"
                        : "bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100"
                    }`}
                  >
                    <span className="whitespace-pre-wrap break-words">
                      {m.text}
                    </span>
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
          <div className="relative z-10 flex items-end gap-2 border-t border-black/10 bg-[#f0f2f5] px-3 py-2 dark:border-white/10 dark:bg-[#202c33] sm:px-4">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="hidden rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 sm:inline-flex"
              >
                <Smile className="h-6 w-6" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            <button className="hidden rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 sm:inline-flex">
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
              >
                <Send className="h-6 w-6" />
              </button>
            ) : (
              <button className="inline-flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
                <Mic className="h-6 w-6" />
              </button>
            )}
          </div>
        </main>
      </div>

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
