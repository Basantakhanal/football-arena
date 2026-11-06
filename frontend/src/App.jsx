import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import PlayerList from "./components/PlayerList";
import CountriesPage from "./pages/CountriesPage";
import ClubsPage from "./pages/ClubsPage";
import { Icon } from "./components/Icons";
import useWatchlist from "./components/UseWatchlist";

const DISPLAY = "font-['Barlow_Condensed',ui-sans-serif,sans-serif]";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";

const NAV = [
  {
    section: "Discover",
    items: [
      { label: "Overview", icon: "grid" },
      { label: "Player database", icon: "user", to: "/" },
      { label: "Clubs & leagues", icon: "shield", to: "/clubs" },
      { label: "Countries", icon: "ball", to: "/countries" },
      { label: "Compare players", icon: "swap" },
      { label: "Watchlist", icon: "bookmark", to: "/?tab=watchlist", badge: true },
    ],
  },
  {
    section: "The fan hub",
    items: [
      { label: "Match centre", icon: "radio" },
      { label: "Community", icon: "chat" },
      { label: "Latest stories", icon: "news" },
    ],
  },
];

const Page = ({ children }) => (
  <div className="mx-auto w-full max-w-7xl px-6 py-8">
    {children}
  </div>
);

export default function App() {
  const { pathname, search } = useLocation();
  const [watch] = useWatchlist();

  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  const onWatchlist =
    pathname === "/" &&
    new URLSearchParams(search).get("tab") === "watchlist";

  const isActive = (to) => {
    if (!to) return false;
    if (to.includes("tab=watchlist")) return onWatchlist;
    if (to === "/") return pathname === "/" && !onWatchlist;
    return pathname.startsWith(to);
  };

  const crumb = pathname.startsWith("/clubs")
    ? "Clubs & leagues"
    : pathname.startsWith("/countries")
      ? "Countries"
      : onWatchlist
        ? "Watchlist"
        : "Player database";

  return (
    <div className="flex h-screen bg-[#070d19] font-['Inter',ui-sans-serif,system-ui,sans-serif] text-slate-200 antialiased selection:bg-blue-500 selection:text-white">

      {/* SIDEBAR */}
      <aside className="hidden w-[208px] shrink-0 flex-col border-r border-[#14203a] bg-[#0a1120] px-3 py-4 lg:flex">

        <Link
          to="/"
          className="mb-6 flex items-center gap-2.5 px-2"
          aria-label="FootballArena home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2d6bf3] text-white">
            <Icon name="ball" size={20} />
          </span>

          <span className={`${DISPLAY} text-xl font-bold tracking-wide text-white`}>
            FOOTBALLARENA
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto" aria-label="Main">
          {NAV.map((group) => (
            <div key={group.section} className="mb-6">

              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {group.section}
              </p>

              <ul className="space-y-1">
                {group.items.map((it) => {
                  const base =
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors";

                  const inner = (
                    <>
                      <Icon name={it.icon} size={16} />

                      <span className="flex-1 text-left">
                        {it.label}
                      </span>

                      {it.badge && watch.length > 0 && (
                        <span className="text-[11px] text-slate-500">
                          {watch.length}
                        </span>
                      )}
                    </>
                  );

                  return (
                    <li key={it.label}>
                      {it.to ? (
                        <Link
                          to={it.to}
                          aria-current={isActive(it.to) ? "page" : undefined}
                          className={`${base} ${
                            isActive(it.to)
                              ? "bg-[#14284d] text-white"
                              : "text-slate-400 hover:bg-[#0f1a30] hover:text-slate-200"
                          }`}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          disabled
                          title="Coming soon"
                          className={`${base} cursor-not-allowed text-slate-600`}
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          disabled
          title="Coming soon"
          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600"
        >
          <Icon name="sliders" size={16} />
          Settings &amp; support
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOP BAR - GLOBAL SEARCH REMOVED */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#14203a] px-5 py-3 lg:px-8">

          <div className="hidden min-w-[180px] items-center gap-2 text-xs text-slate-500 lg:flex">
            <span>Discover</span>
            <Icon name="chevronRight" size={12} />
            <span className="font-medium text-slate-200">
              {crumb}
            </span>
          </div>

          <Link
            to="/"
            className={`${DISPLAY} text-lg font-bold tracking-wide text-white lg:hidden`}
          >
            FOOTBALLARENA
          </Link>

          {/* RIGHT SIDE ICONS */}
          <div className="ml-auto flex min-w-[180px] items-center justify-end gap-3">
            <button
              aria-label="Notifications"
              className="text-slate-400 transition-colors hover:text-white"
            >
              <Icon name="bell" size={17} />
            </button>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16315f] text-slate-200">
              <Icon name="user" size={15} />
            </span>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        <nav
          className="flex gap-2 overflow-x-auto border-b border-[#14203a] px-5 py-2 lg:hidden"
          aria-label="Pages"
        >
          {[
            ["Players", "/"],
            ["Countries", "/countries"],
            ["Clubs", "/clubs"],
          ].map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isActive(to)
                  ? "bg-[#14284d] text-white"
                  : "text-slate-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* PAGE CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<PlayerList />} />

            <Route
              path="/countries"
              element={
                <Page>
                  <CountriesPage />
                </Page>
              }
            />

            <Route
              path="/clubs"
              element={
                <Page>
                  <ClubsPage />
                </Page>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
