"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function CoachFilters({ specialties }: { specialties: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/coaches?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => router.push("/coaches");

  const activeSpecialty = searchParams.get("specialty") || "";
  const activeMaxRate = searchParams.get("maxRate") || "";
  const activeSort = searchParams.get("sort") || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </div>
        {(activeSpecialty || activeMaxRate || activeSort) && (
          <button onClick={clearAll} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
        <select
          value={activeSpecialty}
          onChange={(e) => updateFilter("specialty", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Max Rate */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Max rate: {activeMaxRate ? `$${activeMaxRate}` : "Any"}
        </label>
        <input
          type="range"
          min={25}
          max={500}
          step={25}
          value={activeMaxRate || 500}
          onChange={(e) => updateFilter("maxRate", e.target.value === "500" ? "" : e.target.value)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$25</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
        <div className="space-y-2">
          {[
            { value: "", label: "Top Rated" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={value}
                checked={activeSort === value}
                onChange={() => updateFilter("sort", value)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
