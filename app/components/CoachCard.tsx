import Link from "next/link";
import { MapPin, Clock, Star, Users } from "lucide-react";
import StarRating from "./StarRating";

type Coach = {
  id: string;
  name: string;
  avatar: string | null;
  coachProfile: {
    bio: string;
    specialties: string;
    hourlyRate: number;
    experience: number;
    location: string | null;
    rating: number;
    reviewCount: number;
    sessionCount: number;
    isAvailable: boolean;
  } | null;
};

export default function CoachCard({ coach }: { coach: Coach }) {
  const profile = coach.coachProfile;
  if (!profile) return null;
  const specialties: string[] = JSON.parse(profile.specialties || "[]");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {coach.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{coach.name}</h3>
                {profile.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </p>
                )}
              </div>
              {profile.isAvailable && (
                <span className="flex-shrink-0 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-100">
                  Available
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              {s}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
              +{specialties.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <StarRating rating={profile.rating} />
              <span className="font-medium text-gray-700 ml-1">{profile.rating.toFixed(1)}</span>
              <span>({profile.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {profile.experience}y exp
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {profile.sessionCount}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">${profile.hourlyRate}</span>
          <span className="text-gray-500 text-sm">/session</span>
        </div>
        <Link
          href={`/coaches/${coach.id}`}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
