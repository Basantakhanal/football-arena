
import { Link, NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Players", end: true },
  { to: "/countries", label: "Countries" },
  { to: "/clubs", label: "Clubs" },
  { to: "/voting", label: "Voting" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-800/70 bg-[#050b18]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* BRAND */}
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="Football Arena home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v5M15.5 10.5L20 9M14.2 14.5l2.8 3.5M9.8 14.5L7 18M8.5 10.5L4 9" />
            </svg>
          </span>

          <span className="leading-none">
            <span className="block text-xl font-black tracking-[0.12em]">
              <span className="text-white">FOOTBALL</span>
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                ARENA
              </span>
            </span>

            <span className="mt-1.5 hidden text-[10px] font-semibold tracking-[0.25em] text-slate-500 sm:block">
              DATABASE &amp; FAN HUB
            </span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav
          className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-800 bg-[#0a1424] p-1.5"
          aria-label="Main navigation"
        >
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

      </div>
    </header>
  );
}
