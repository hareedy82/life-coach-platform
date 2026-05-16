"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function setupCoachProfile(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "coach") return { error: "Unauthorized" };

  const bio = formData.get("bio") as string;
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
  const experience = parseInt(formData.get("experience") as string);
  const location = formData.get("location") as string;
  const languages = formData.get("languages") as string;
  const specialtiesRaw = formData.getAll("specialties") as string[];

  if (!bio || isNaN(hourlyRate)) return { error: "Bio and hourly rate are required" };

  await prisma.coachProfile.upsert({
    where: { userId: session.userId },
    update: {
      bio, hourlyRate, experience: experience || 0,
      location: location || null, languages: languages || "English",
      specialties: JSON.stringify(specialtiesRaw),
    },
    create: {
      userId: session.userId, bio, hourlyRate,
      experience: experience || 0, location: location || null,
      languages: languages || "English",
      specialties: JSON.stringify(specialtiesRaw),
    },
  });

  revalidatePath("/dashboard/coach");
  redirect("/dashboard/coach");
}

export async function updateSessionStatus(sessionId: string, status: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!dbSession) return { error: "Session not found" };
  if (dbSession.coachId !== session.userId && dbSession.clientId !== session.userId) {
    return { error: "Unauthorized" };
  }

  await prisma.session.update({ where: { id: sessionId }, data: { status } });
  revalidatePath("/dashboard/coach");
  revalidatePath("/dashboard/client");
  return { success: true };
}
