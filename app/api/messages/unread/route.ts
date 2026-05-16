import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ count: 0 });

  const count = await prisma.message.count({
    where: { receiverId: session.userId, read: false },
  });

  return Response.json({ count });
}
