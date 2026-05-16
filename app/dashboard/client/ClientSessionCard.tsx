"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, Clock, DollarSign, Video, Star, XCircle, MessageSquare } from "lucide-react";

type Session = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  topic: string | null;
  meetingLink: string | null;
  price: number;
  coach: { id: string; name: string };
  review: { rating: number; comment: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-green-50 text-green-700 border-green-100",
  cancelled: "bg-gray-50 text-gray-500 border-gray-100",
};

export default function ClientSessionCard({ session }: { session: Session }) {
  const [status, setStatus] = useState(session.status);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReview, setHasReview] = useState(!!session.review);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isPending, startTransition] = useTransition();

  const cancelSession = () => {
    startTransition(async () => {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) setStatus("cancelled");
    });
  };

  const submitReview = () => {
    setReviewError("");
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, rating, comment }),
      });
      if (res.ok) {
        setHasReview(true);
        setShowReviewForm(false);
      } else {
        const data = await res.json();
        setReviewError(data.error || "Failed to submit review");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {session.coach.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/coaches/${session.coach.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              {session.coach.name}
            </Link>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {session.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {session.startTime}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-green-500" />
              ${session.price}
            </span>
            {session.topic && (
              <span className="flex items-center gap-1.5 col-span-2 sm:col-span-3">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{session.topic}</span>
              </span>
            )}
          </div>

          {session.meetingLink && status === "confirmed" && (
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Video className="w-4 h-4" />
              Join Meeting
            </a>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {status === "confirmed" && (
              <button onClick={cancelSession} disabled={isPending} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
            {status === "completed" && !hasReview && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium">
                <Star className="w-4 h-4" />
                Leave a review
              </button>
            )}
            {hasReview && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                <Star className="w-4 h-4 fill-current" />
                Reviewed
              </span>
            )}
            {["pending", "confirmed", "completed"].includes(status) && (
              <Link
                href={`/messages/${session.coach.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium ml-auto"
              >
                <MessageSquare className="w-4 h-4" />
                Message coach
              </Link>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)} className="text-2xl transition-transform hover:scale-110">
                      {s <= rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
              <div className="flex gap-2">
                <button onClick={submitReview} disabled={isPending || !comment.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {isPending ? "Submitting..." : "Submit Review"}
                </button>
                <button onClick={() => setShowReviewForm(false)} className="text-gray-500 hover:text-gray-700 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
