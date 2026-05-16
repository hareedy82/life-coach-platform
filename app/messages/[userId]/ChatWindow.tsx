"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { Send, ArrowLeft, User } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
};

type Partner = {
  id: string;
  name: string;
  role: string;
  coachProfile: { hourlyRate: number } | null;
};

type CurrentUser = { id: string; name: string; role: string };

const POLL_INTERVAL = 3000;

export default function ChatWindow({
  currentUser,
  partner,
  initialMessages,
}: {
  currentUser: CurrentUser;
  partner: Partner;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const latestIdRef = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].id : null
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("instant");
  }, [scrollToBottom]);

  // Poll for new messages
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/messages?with=${partner.id}`);
        if (!res.ok) return;
        const data: Message[] = await res.json();
        setMessages(data);
        const newLatest = data.length > 0 ? data[data.length - 1].id : null;
        if (newLatest && newLatest !== latestIdRef.current) {
          latestIdRef.current = newLatest;
          setTimeout(() => scrollToBottom(), 50);
        }
      } catch {
        // Ignore poll errors
      }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [partner.id, scrollToBottom]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || isPending) return;
    setError("");
    setInput("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(), 50);

    startTransition(async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partner.id, content }),
      });
      if (!res.ok) {
        // Roll back optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError("Failed to send. Please try again.");
        setInput(content);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/messages" className="text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {partner.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 leading-tight">{partner.name}</p>
          <p className="text-xs text-gray-400 capitalize">
            {partner.role}
            {partner.coachProfile && ` · $${partner.coachProfile.hourlyRate}/session`}
          </p>
        </div>
        {partner.role === "coach" && (
          <Link
            href={`/coaches/${partner.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">View profile</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
              {partner.name.charAt(0)}
            </div>
            <p className="font-semibold text-gray-900 mb-1">{partner.name}</p>
            <p className="text-sm text-gray-500">Start the conversation</p>
          </div>
        )}

        {groups.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">{date}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {msgs.map((msg, i) => {
              const isOwn = msg.senderId === currentUser.id;
              const prevMsg = msgs[i - 1];
              const nextMsg = msgs[i + 1];
              const isSameAsPrev = prevMsg && prevMsg.senderId === msg.senderId;
              const isSameAsNext = nextMsg && nextMsg.senderId === msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isSameAsPrev ? "mt-0.5" : "mt-3"}`}
                >
                  {/* Avatar spacer for grouping */}
                  {!isOwn && (
                    <div className="w-8 flex-shrink-0 mr-2 self-end">
                      {!isSameAsNext && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {partner.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="max-w-[75%] sm:max-w-[60%]">
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isOwn
                          ? `bg-indigo-600 text-white ${isSameAsPrev ? "rounded-t-lg" : "rounded-tl-2xl rounded-tr-2xl"} ${isSameAsNext ? "rounded-b-lg" : "rounded-bl-2xl rounded-br-sm"}`
                          : `bg-white border border-gray-100 text-gray-800 shadow-sm ${isSameAsPrev ? "rounded-t-lg" : "rounded-tl-2xl rounded-tr-2xl"} ${isSameAsNext ? "rounded-b-lg" : "rounded-bl-sm rounded-br-2xl"}`
                      } ${msg.id.startsWith("temp-") ? "opacity-70" : ""}`}
                    >
                      {msg.content}
                    </div>
                    {/* Timestamp — only for last message in a group */}
                    {!isSameAsNext && (
                      <p className={`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                        {formatMsgTime(new Date(msg.createdAt))}
                        {isOwn && msg.read && !msg.id.startsWith("temp-") && (
                          <span className="ml-1 text-indigo-400">· read</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 text-center mt-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partner.name}…`}
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-400 overflow-hidden"
          style={{ minHeight: "42px", maxHeight: "120px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isPending}
          className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; msgs: Message[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const label = formatDateLabel(d);
    if (label !== currentDate) {
      currentDate = label;
      groups.push({ date: label, msgs: [msg] });
    } else {
      groups[groups.length - 1].msgs.push(msg);
    }
  }
  return groups;
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDay.getTime() === today.getTime()) return "Today";
  if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
