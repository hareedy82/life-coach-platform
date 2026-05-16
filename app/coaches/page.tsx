import { prisma } from "@/app/lib/prisma";
import CoachCard from "@/app/components/CoachCard";
import CoachFilters from "./CoachFilters";

const SPECIALTIES = [
  "Career & Leadership", "Life Balance", "Relationships",
  "Health & Wellness", "Mindset & Confidence", "Business & Finance",
  "Stress Management", "Parenting", "Communication Skills",
];

async function getCoaches(specialty?: string, maxRate?: string, sort?: string) {
  const coaches = await prisma.user.findMany({
    where: {
      role: "coach",
      coachProfile: { isNot: null },
    },
    include: { coachProfile: true },
  });

  let filtered = coaches.filter((c) => c.coachProfile !== null);

  if (specialty) {
    filtered = filtered.filter((c) => {
      const specs: string[] = JSON.parse(c.coachProfile?.specialties || "[]");
      return specs.some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
    });
  }

  if (maxRate) {
    const max = parseFloat(maxRate);
    filtered = filtered.filter((c) => (c.coachProfile?.hourlyRate ?? 0) <= max);
  }

  if (sort === "price_asc") {
    filtered.sort((a, b) => (a.coachProfile?.hourlyRate ?? 0) - (b.coachProfile?.hourlyRate ?? 0));
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => (b.coachProfile?.hourlyRate ?? 0) - (a.coachProfile?.hourlyRate ?? 0));
  } else {
    filtered.sort((a, b) => (b.coachProfile?.rating ?? 0) - (a.coachProfile?.rating ?? 0));
  }

  return filtered;
}

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; maxRate?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const coaches = await getCoaches(params.specialty, params.maxRate, params.sort);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Coach</h1>
        <p className="text-gray-600">Browse {coaches.length} certified coaches ready to help you grow</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <CoachFilters specialties={SPECIALTIES} />
        </aside>

        {/* Coach grid */}
        <div className="flex-1">
          {coaches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No coaches found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
