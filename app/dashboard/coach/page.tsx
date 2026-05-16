import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import SessionCard from "./SessionCard";
import { DollarSign, Calendar, Star, Users, Settings, Plus } from "lucide-react";

export default async function CoachDashboard() {
  const session = await getSession();
  if (!session || session.role !== "coach") redirect("/login");

  const coach = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { coachProfile: true },
  });

  if (!coach?.coachProfile) redirect("/dashboard/coach/setup");

  const sessions = await prisma.session.findMany({
    where: { coachId: session.userId },
    include: { client: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const pending = sessions.filter((s) => s.status === "pending");
  const upcoming = sessions.filter((s) => s.status === "confirmed");
  const completed = sessions.filter((s) => s.status === "completed");

  const totalEarnings = completed.reduce((sum, s) => sum + s.price, 0);
  const profile = coach.coachProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Welcome back, {session.name.split(" ")[0]}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/coach/setup"
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>
          <Link
            href={`/coaches/${session.userId}`}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            View Public Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <DollarSign className="w-5 h-5" />, label: "Total Earnings", value: `$${totalEarnings.toFixed(0)}`, color: "text-green-600 bg-green-50" },
          { icon: <Calendar className="w-5 h-5" />, label: "Total Sessions", value: profile.sessionCount, color: "text-blue-600 bg-blue-50" },
          { icon: <Star className="w-5 h-5" />, label: "Rating", value: profile.rating.toFixed(1), color: "text-amber-600 bg-amber-50" },
          { icon: <Users className="w-5 h-5" />, label: "Pending Requests", value: pending.length, color: "text-purple-600 bg-purple-50" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              {icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pending Requests
            <span className="ml-2 text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
          </h2>
          <div className="space-y-3">
            {pending.map((s) => (
              <SessionCard key={s.id} session={s} role="coach" />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming sessions */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} role="coach" />
            ))}
          </div>
        </div>
      )}

      {/* Past sessions */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Completed Sessions</h2>
          <div className="space-y-3">
            {completed.slice(0, 5).map((s) => (
              <SessionCard key={s.id} session={s} role="coach" />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
          <p className="text-gray-500 mb-6">Your profile is live. Clients can start booking sessions with you.</p>
          <Link
            href={`/coaches/${session.userId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            View Your Profile
          </Link>
        </div>
      )}
    </div>
  );
}
