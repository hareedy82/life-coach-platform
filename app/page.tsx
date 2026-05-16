import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import CoachCard from "@/app/components/CoachCard";
import { Search, Star, Shield, Calendar, ArrowRight, CheckCircle } from "lucide-react";

const SPECIALTIES = [
  { name: "Career & Leadership", icon: "💼", desc: "Navigate career transitions and grow as a leader" },
  { name: "Life Balance", icon: "⚖️", desc: "Achieve harmony between work and personal life" },
  { name: "Relationships", icon: "💬", desc: "Build stronger, healthier connections" },
  { name: "Health & Wellness", icon: "🌿", desc: "Transform your habits and well-being" },
  { name: "Mindset & Confidence", icon: "🧠", desc: "Overcome limiting beliefs and gain clarity" },
  { name: "Business & Finance", icon: "📈", desc: "Build your business and secure your future" },
];

async function getFeaturedCoaches() {
  return prisma.user.findMany({
    where: { role: "coach", coachProfile: { isNot: null } },
    include: { coachProfile: true },
    orderBy: { coachProfile: { rating: "desc" } },
    take: 3,
  });
}

export default async function HomePage() {
  const coaches = await getFeaturedCoaches();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Trusted by 10,000+ clients worldwide
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Unlock Your{" "}
              <span className="text-amber-300">Full Potential</span>{" "}
              with Expert Life Coaching
            </h1>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
              Connect with certified life coaches who will guide you toward clarity, confidence, and meaningful growth. Transform your life — one session at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/coaches"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg text-lg"
              >
                <Search className="w-5 h-5" />
                Find Your Coach
              </Link>
              <Link
                href="/register?role=coach"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all text-lg"
              >
                Become a Coach
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-indigo-200">
              {["No subscription required", "Cancel anytime", "Verified coaches"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Certified Coaches" },
              { value: "10K+", label: "Happy Clients" },
              { value: "50K+", label: "Sessions Completed" },
              { value: "4.9/5", label: "Average Rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-indigo-600">{value}</p>
                <p className="text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Coaching for Every Goal</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whatever challenge you&apos;re facing, we have an expert coach ready to help.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map(({ name, icon, desc }) => (
              <Link
                key={name}
                href={`/coaches?specialty=${encodeURIComponent(name)}`}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{name}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Coaches */}
      {coaches.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Top-Rated Coaches</h2>
                <p className="text-gray-600">Highly recommended by their clients</p>
              </div>
              <Link
                href="/coaches"
                className="hidden sm:inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                View all coaches
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Start your transformation in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: <Search className="w-7 h-7" />, title: "Find Your Match", desc: "Browse our curated directory of certified coaches filtered by specialty, price, and availability." },
              { step: "2", icon: <Calendar className="w-7 h-7" />, title: "Book a Session", desc: "Schedule your session at a time that works for you. Pay securely, get confirmation instantly." },
              { step: "3", icon: <Star className="w-7 h-7" />, title: "Transform Your Life", desc: "Connect with your coach via video call and start working toward your goals." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {icon}
                </div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Step {step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Transform Your Life?</h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of people who have already taken the first step toward a better life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/coaches"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg text-lg"
            >
              Browse Coaches
            </Link>
            <Link
              href="/register?role=coach"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all text-lg"
            >
              <Shield className="w-5 h-5" />
              Apply as a Coach
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
