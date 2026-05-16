import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import ClientSessionCard from "./ClientSessionCard";
import { Calendar, Search, Star, Clock } from "lucide-react";

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/login");

  const sessions = await prisma.session.findMany({
    where: { clientId: session.userId },
    include: {
      coach: { select: { id: true, name: true } },
      review: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const upcoming = sessions.filter((s) => ["pending", "confirmed"].includes(s.status));
  const completed = sessions.filter((s) => s.status === "completed");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Welcome back, {session.name.split(" ")[0]}</p>
        </div>
        <Link
          href="/coaches"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          Find a Coach
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Clock className="w-5 h-5" />, label: "Upcoming", value: upcoming.length, color: "text-blue-600 bg-blue-50" },
          { icon: <Calendar className="w-5 h-5" />, label: "Completed", value: completed.length, color: "text-green-600 bg-green-50" },
          { icon: <Star className="w-5 h-5" />, label: "Reviews Left", value: completed.filter((s) => !s.review).length, color: "text-amber-600 bg-amber-50" },
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

      {/* Upcoming sessions */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcoming.map((s) => (
              <ClientSessionCard key={s.id} session={s} />
            ))}
          </div>
        </div>
      )}

      {/* Completed sessions */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Past Sessions</h2>
          <div className="space-y-3">
            {completed.map((s) => (
              <ClientSessionCard key={s.id} session={s} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🎯</p>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start your journey</h3>
          <p className="text-gray-500 mb-6">Browse our coaches and book your first session.</p>
          <Link
            href="/coaches"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Find a Coach
          </Link>
        </div>
      )}
    </div>
  );
}
