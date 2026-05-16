import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import ChatWindow from "./ChatWindow";

export default async function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const partner = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, coachProfile: { select: { hourlyRate: true } } },
  });
  if (!partner) notFound();

  // Fetch initial messages
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: userId },
        { senderId: userId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark incoming as read
  await prisma.message.updateMany({
    where: { senderId: userId, receiverId: session.userId, read: false },
    data: { read: true },
  });

  return (
    <ChatWindow
      currentUser={{ id: session.userId, name: session.name, role: session.role }}
      partner={partner}
      initialMessages={messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
      }))}
    />
  );
}
