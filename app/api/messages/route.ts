import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withId = searchParams.get("with");
  if (!withId) return Response.json({ error: "Missing 'with' param" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: withId },
        { senderId: withId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: withId, receiverId: session.userId, read: false },
    data: { read: true },
  });

  return Response.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();
  if (!receiverId || !content?.trim()) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { senderId: session.userId, receiverId, content },
  });

  return Response.json(message, { status: 201 });
}
