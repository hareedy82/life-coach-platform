"use client";

import { useState, useTransition } from "react";
import { Calendar, Clock } from "lucide-react";

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BookingForm({
  coachId,
  hourlyRate,
  availability,
  clientId,
}: {
  coachId: string;
  hourlyRate: number;
  availability: Availability[];
  clientId: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const availableDays = availability.map((a) => a.dayOfWeek);

  const isDateAvailable = (d: string) => {
    if (!d) return true;
    const dayOfWeek = new Date(d + "T12:00:00").getDay();
    return availableDays.includes(dayOfWeek);
  };

  const getAvailableTimesForDate = (d: string) => {
    if (!d) return TIME_SLOTS;
    const dayOfWeek = new Date(d + "T12:00:00").getDay();
    const slot = availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!slot) return [];
    return TIME_SLOTS.filter((t) => t >= slot.startTime && t < slot.endTime);
  };

  const availableTimes = getAvailableTimesForDate(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !time) {
      setError("Please select a date and time.");
      return;
    }
    if (!isDateAvailable(date)) {
      setError("Coach is not available on that day.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          clientId,
          date,
          startTime: time,
          endTime: `${String(parseInt(time) + 1).padStart(2, "0")}:00`,
          topic,
          price: hourlyRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to book session");
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-semibold text-gray-900 mb-1">Session Requested!</h3>
        <p className="text-sm text-gray-500">The coach will confirm your session shortly. Check your dashboard for updates.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2 text-sm">{error}</div>
      )}

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Calendar className="w-4 h-4" />
          Select Date
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => { setDate(e.target.value); setTime(""); }}
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
        />
        {date && !isDateAvailable(date) && (
          <p className="text-xs text-red-500 mt-1">
            Not available on {DAY_NAMES[new Date(date + "T12:00:00").getDay()]}s
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Clock className="w-4 h-4" />
          Select Time
        </label>
        {availableTimes.length === 0 && date ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">No slots available on this day.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {availableTimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`text-xs py-2 rounded-lg border transition-colors ${
                  time === t
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">What do you want to work on?</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Briefly describe your goals..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !date || !time}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Booking..." : `Book for $${hourlyRate}`}
      </button>

      <p className="text-xs text-gray-400 text-center">You won&apos;t be charged until the coach confirms</p>
    </form>
  );
}
