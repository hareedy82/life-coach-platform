import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import StarRating from "@/app/components/StarRating";
import BookingForm from "./BookingForm";
import { MapPin, Clock, Globe, Star, Users, Calendar, CheckCircle, MessageSquare } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const coach = await prisma.user.findUnique({
    where: { id },
    include: {
      coachProfile: { include: { availability: true } },
    },
  });

  if (!coach || !coach.coachProfile) notFound();

  const reviews = await prisma.review.findMany({
    where: { coachId: id },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const profile = coach.coachProfile;
  const specialties: string[] = JSON.parse(profile.specialties || "[]");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {coach.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{coach.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {profile.experience} years exp
                      </span>
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  {profile.isAvailable && (
                    <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-100">
                      Available
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={profile.rating} size="md" />
                    <span className="font-semibold text-gray-800">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({profile.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {profile.sessionCount} sessions
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {specialties.map((s) => (
                <span key={s} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-bold text-gray-900">{profile.languages}</div>
                <div className="text-xs text-gray-500 mt-0.5">Languages</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">${profile.hourlyRate}</div>
                <div className="text-xs text-gray-500 mt-0.5">Per session</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">{profile.experience}+</div>
                <div className="text-xs text-gray-500 mt-0.5">Years exp</div>
              </div>
            </div>
          </div>

          {/* Availability */}
          {profile.availability.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Weekly Availability
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profile.availability.map((slot) => (
                  <div key={slot.id} className="bg-indigo-50 rounded-xl px-3 py-2 text-sm">
                    <div className="font-semibold text-indigo-800">{DAY_NAMES[slot.dayOfWeek]}</div>
                    <div className="text-indigo-600 text-xs mt-0.5">{slot.startTime} – {slot.endTime}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-600" />
              Client Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">{review.client.name}</div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">${profile.hourlyRate}</div>
              <div className="text-gray-500 text-sm">per 60-min session</div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "1-on-1 private session",
                "Flexible scheduling",
                "Video call via your preferred platform",
                "Session notes & follow-up",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {session ? (
              session.role === "client" ? (
                <>
                  <BookingForm coachId={coach.id} hourlyRate={profile.hourlyRate} availability={profile.availability} clientId={session.userId} />
                  <Link
                    href={`/messages/${coach.id}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message {coach.name.split(" ")[0]}
                  </Link>
                </>
              ) : (
                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                  Switch to a client account to book sessions.
                </div>
              )
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/register?role=client`}
                  className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Sign in to book
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
