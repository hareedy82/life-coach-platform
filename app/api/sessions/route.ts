import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { coachId, date, startTime, endTime, topic, price } = body;

  if (!coachId || !date || !startTime || !price) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newSession = await prisma.session.create({
    data: {
      coachId,
      clientId: session.userId,
      date,
      startTime,
      endTime: endTime || "",
      topic: topic || null,
      price,
      status: "pending",
    },
  });

  return Response.json(newSession, { status: 201 });
}
