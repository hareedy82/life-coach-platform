import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import { MessageSquare } from "lucide-react";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all messages involving this user
  const allMessages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.userId }, { receiverId: session.userId }],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate into conversations keyed by partner id
  const seen = new Map<string, {
    partner: { id: string; name: string; role: string };
    latestMessage: string;
    latestAt: Date;
    unreadCount: number;
  }>();

  for (const msg of allMessages) {
    const isOwn = msg.senderId === session.userId;
    const partnerId = isOwn ? msg.receiverId : msg.senderId;
    const partner = isOwn ? msg.receiver : msg.sender;

    if (!seen.has(partnerId)) {
      const unreadCount = allMessages.filter(
        (m) => m.senderId === partnerId && m.receiverId === session.userId && !m.read,
      ).length;
      seen.set(partnerId, {
        partner,
        latestMessage: msg.content,
        latestAt: msg.createdAt,
        unreadCount,
      });
    }
  }

  const conversations = Array.from(seen.values()).sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime(),
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {totalUnread > 0 && (
          <span className="ml-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm">
            {session.role === "client"
              ? "Find a coach and send them a message to get started."
              : "Clients will message you here once they discover your profile."}
          </p>
          {session.role === "client" && (
            <Link
              href="/coaches"
              className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
            >
              Browse Coaches
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {conversations.map(({ partner, latestMessage, latestAt, unreadCount }) => (
            <Link
              key={partner.id}
              href={`/messages/${partner.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {partner.name.charAt(0)}
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`font-semibold text-gray-900 truncate ${unreadCount > 0 ? "font-bold" : ""}`}>
                    {partner.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTime(new Date(latestAt))}
                  </span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                  {latestMessage}
                </p>
                <span className="text-xs text-indigo-400 mt-0.5 capitalize">{partner.role}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
