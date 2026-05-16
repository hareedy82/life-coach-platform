import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, rating, comment } = await req.json();
  if (!sessionId || !rating || !comment) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!dbSession || dbSession.clientId !== session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (dbSession.status !== "completed") {
    return Response.json({ error: "Session not completed" }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({ where: { sessionId } });
  if (existing) return Response.json({ error: "Already reviewed" }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      sessionId,
      coachId: dbSession.coachId,
      clientId: session.userId,
      rating: parseInt(rating),
      comment,
    },
  });

  // Update coach rating
  const allReviews = await prisma.review.findMany({ where: { coachId: dbSession.coachId } });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await prisma.coachProfile.update({
    where: { userId: dbSession.coachId },
    data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: allReviews.length },
  });

  return Response.json(review, { status: 201 });
}
