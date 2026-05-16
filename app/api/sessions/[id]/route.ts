import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, meetingLink } = body;

  const dbSession = await prisma.session.findUnique({ where: { id } });
  if (!dbSession) return Response.json({ error: "Not found" }, { status: 404 });
  if (dbSession.coachId !== session.userId && dbSession.clientId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.session.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(meetingLink !== undefined && { meetingLink }),
    },
  });

  return Response.json(updated);
}
