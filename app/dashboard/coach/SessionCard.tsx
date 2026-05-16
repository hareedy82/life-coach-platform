"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Calendar, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, Video } from "lucide-react";

type Session = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  topic: string | null;
  meetingLink: string | null;
  price: number;
  client?: { id: string; name: string; email: string };
  coach?: { id: string; name: string };
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-100",
  confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  completed: "bg-green-50 text-green-700 border-green-100",
  cancelled: "bg-gray-50 text-gray-500 border-gray-100",
};

export default function SessionCard({ session, role }: { session: Session; role: "coach" | "client" }) {
  const [status, setStatus] = useState(session.status);
  const [meetingLink, setMeetingLink] = useState(session.meetingLink || "");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateStatus = (newStatus: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    });
  };

  const saveMeetingLink = () => {
    startTransition(async () => {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingLink }),
      });
      if (res.ok) setShowLinkInput(false);
    });
  };

  const person = role === "coach" ? session.client : session.coach;
  const personLabel = role === "coach" ? "Client" : "Coach";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {person?.name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{person?.name}</div>
              <div className="text-xs text-gray-500">{personLabel}</div>
            </div>
            <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {session.date}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-4 h-4 text-indigo-400" />
              {session.startTime} – {session.endTime}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <DollarSign className="w-4 h-4 text-green-500" />
              ${session.price}
            </div>
            {session.topic && (
              <div className="flex items-center gap-1.5 text-gray-600 col-span-2 sm:col-span-1">
                <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{session.topic}</span>
              </div>
            )}
          </div>

          {/* Meeting link */}
          {(status === "confirmed") && (
            <div className="mt-3">
              {showLinkInput ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={saveMeetingLink} disabled={isPending} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                    Save
                  </button>
                </div>
              ) : meetingLink ? (
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  <Video className="w-4 h-4" />
                  Join Meeting
                </a>
              ) : role === "coach" ? (
                <button onClick={() => setShowLinkInput(true)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  Add meeting link
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {(role === "coach" && (status === "pending" || status === "confirmed")) || (role === "client" && status === "confirmed") ? (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
          {role === "coach" && status === "pending" && (
            <>
              <button
                onClick={() => updateStatus("confirmed")}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 border border-green-100 py-2 rounded-xl text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </button>
              <button
                onClick={() => updateStatus("cancelled")}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-700 border border-red-100 py-2 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </>
          )}
          {role === "coach" && status === "confirmed" && (
            <button
              onClick={() => updateStatus("completed")}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 py-2 px-4 rounded-xl text-sm font-medium hover:bg-indigo-100 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Completed
            </button>
          )}
          {role === "client" && status === "confirmed" && (
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <XCircle className="w-4 h-4" />
              Cancel session
            </button>
          )}
          {/* Message link always shown for active sessions */}
          {person?.id && (
            <Link
              href={`/messages/${person.id}`}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium ml-auto"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
