import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

// Returns a list of all unique conversation partners with their latest message and unread count
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.userId }, { receiverId: session.userId }],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build a map: partnerId -> { partner, latestMessage, unreadCount }
  const seen = new Map<string, {
    partner: { id: string; name: string; role: string };
    latestMessage: { content: string; createdAt: Date; senderId: string };
    unreadCount: number;
  }>();

  for (const msg of messages) {
    const partnerId = msg.senderId === session.userId ? msg.receiverId : msg.senderId;
    const partner = msg.senderId === session.userId ? msg.receiver : msg.sender;

    if (!seen.has(partnerId)) {
      const unreadCount = messages.filter(
        (m) => m.senderId === partnerId && m.receiverId === session.userId && !m.read
      ).length;

      seen.set(partnerId, {
        partner,
        latestMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId },
        unreadCount,
      });
    }
  }

  return Response.json(Array.from(seen.values()));
}
