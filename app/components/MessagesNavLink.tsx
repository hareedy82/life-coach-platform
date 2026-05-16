"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function MessagesNavLink() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const { count } = await res.json();
          setUnread(count);
        }
      } catch {
        // Ignore
      }
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link href="/messages" className="relative flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
      <MessageSquare className="w-5 h-5" />
      <span className="hidden sm:inline">Messages</span>
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-0.5 bg-indigo-600 text-white text-xs font-bold w-4 h-4 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0 rounded-full flex items-center justify-center sm:rounded-full leading-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
