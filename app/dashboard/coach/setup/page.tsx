"use client";

import { useActionState } from "react";
import { setupCoachProfile } from "@/app/actions/coach";

const SPECIALTIES = [
  "Career & Leadership", "Life Balance", "Relationships",
  "Health & Wellness", "Mindset & Confidence", "Business & Finance",
  "Stress Management", "Parenting", "Communication Skills",
  "Productivity", "Emotional Intelligence", "Purpose & Meaning",
];

export default function CoachSetupPage() {
  const [state, action, pending] = useActionState(setupCoachProfile, null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Coach Profile</h1>
        <p className="text-gray-500 mt-1">Tell clients about yourself and your coaching approach</p>
      </div>

      {state?.error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">About You</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio <span className="text-red-500">*</span></label>
              <textarea
                name="bio"
                required
                rows={4}
                placeholder="Tell clients about your coaching philosophy, approach, and what makes you unique..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  min={0}
                  max={50}
                  defaultValue={0}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York, NY"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Languages</label>
              <input
                type="text"
                name="languages"
                defaultValue="English"
                placeholder="English, Spanish..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Specialties</h2>
          <p className="text-sm text-gray-500 mb-4">Select all areas you coach in</p>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALTIES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="specialties" value={s} className="accent-indigo-600 w-4 h-4" />
                <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hourly Rate (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                name="hourlyRate"
                required
                min={10}
                max={1000}
                step={5}
                defaultValue={100}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Per 60-minute session</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
