import Link from "next/link";
import { getSession } from "@/app/lib/session";
import { logout } from "@/app/actions/auth";
import { UserCircle } from "lucide-react";
import MessagesNavLink from "./MessagesNavLink";

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">LifeCoach</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/coaches" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Find a Coach
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              How it Works
            </Link>
            <Link href="/#specialties" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Specialties
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <MessagesNavLink />
                <Link
                  href={session.role === "coach" ? "/dashboard/coach" : "/dashboard/client"}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
                </Link>
                <form action={logout}>
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
