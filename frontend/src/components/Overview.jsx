import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL, Avatar, ClubBadge, Flag, normalizePlayer } from "./PlayerUtils";

export default function Overview() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_URL);
        
        // Flexible parsing: handles direct arrays or object wrappers
        const playerList = Array.isArray(data) 
          ? data 
          : (data.players || data.data || []);

        setPlayers(playerList.map(normalizePlayer));
      } catch (err) {
        console.error("Failed to load overview data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  // Calculate dynamic stats from actual database records
  const totalPlayers = players.length;
  const uniqueClubs = new Set(players.map((p) => p.club).filter(Boolean)).size;
  const uniqueCountries = new Set(players.map((p) => p.country).filter(Boolean)).size;
  const totalGoals = players.reduce((acc, p) => acc + (Number(p.goals) || 0), 0);

  // Player of the Week (Pick highest rated player, fallback to first player)
  const spotlightPlayer = players.length > 0 
    ? [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] 
    : null;

  // Popular Leagues with unified professional slate theme colors
  const popularLeagues = [
    { name: "Premier League", country: "England", code: "ENG", matches: "380 Games" },
    { name: "La Liga", country: "Spain", code: "ESP", matches: "380 Games" },
    { name: "Bundesliga", country: "Germany", code: "GER", matches: "306 Games" },
    { name: "Serie A", country: "Italy", code: "ITA", matches: "380 Games" },
  ];

  return (
    <div className="w-full bg-[#081120] font-sans text-slate-200 antialiased overflow-x-hidden">
      
      {/* 1. MAIN HERO SECTION */}
      <section className="relative h-[calc(100vh-73px)] min-h-[550px] max-h-[750px] flex flex-col items-center justify-center overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] via-[#0b1322] to-[#081120] px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center my-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 shadow-sm">
            ⚽ The Football Pulse
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl leading-tight">
            The world of football, at a glance.
          </h1>
          <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-400 max-w-xl leading-relaxed">
            Manage your custom scouting database, analyze top-flight player metrics, track match feeds, and monitor performance stats in real-time.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/players"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:-translate-y-0.5"
            >
              <span>🔍</span> Explore Players
            </Link>
            <Link
              to="/countries"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              <span>🌍</span> Explore Leagues & Nations
            </Link>
            <Link
              to="/players"
              onClick={() => localStorage.setItem("fph-view", "Favorites")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              <span>⭐</span> Watchlist / Favorites
            </Link>
          </div>
        </div>

        {/* Scroll down indicator arrow hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scroll Down</span>
          <span className="text-xs">↓</span>
        </div>
      </section>

      {/* 2. SCROLLABLE CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 py-12 sm:py-16">

        {/* FOOTBALL AT A GLANCE (Dynamic Database Statistics) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">Football at a Glance</h2>
              <p className="text-xs text-slate-400">Live aggregated counts from your Supabase database repository.</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live DB Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { label: "Total Players Tracked", value: totalPlayers, icon: "👤", border: "border-blue-500/30" },
              { label: "Registered Clubs", value: uniqueClubs, icon: "⚽", border: "border-indigo-500/30" },
              { label: "Nations / Countries", value: uniqueCountries, icon: "🌍", border: "border-cyan-500/30" },
              { label: "Total Career Goals", value: totalGoals, icon: "⚡", border: "border-emerald-500/30" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-b from-[#111f35]/90 to-[#0d1829] p-5 sm:p-6 shadow-xl backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl">{stat.icon}</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">{loading ? "..." : stat.value}</span>
                </div>
                <h3 className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">{stat.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* 3. eFootball Card Spotlight & 4. EXPLORE BY COMPETITION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Player of the Week eFootball Card Spotlight */}
          <div className="lg:col-span-1 flex flex-col">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase mb-5 sm:mb-6">⭐ Player of the Week</h2>
            
            {loading ? (
              <div className="h-[450px] rounded-3xl border border-purple-500/30 bg-slate-900 animate-pulse"></div>
            ) : spotlightPlayer ? (
              <div className="relative flex-1 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-purple-500/80 bg-gradient-to-b from-[#1e1035] via-[#140b24] to-[#0a0514] p-5 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                
                {/* Background decorative glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none"></div>

                {/* Top Header info (Position badge & Club Badge) */}
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white uppercase tracking-widest bg-purple-950/80 px-2.5 py-1 rounded border border-purple-500/40 inline-block">
                      {spotlightPlayer.position || "CF"}
                    </div>
                  </div>

                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-purple-400/40 p-1 shadow-md">
                    <ClubBadge src={spotlightPlayer.club_logo} name={spotlightPlayer.club} size={40} />
                  </div>
                </div>

                {/* Center Player Photo Preview */}
                <div className="relative z-10 my-2 h-48 sm:h-56 w-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0514] to-transparent z-10"></div>
                  {spotlightPlayer.photo_url ? (
                    <img 
                      src={spotlightPlayer.photo_url} 
                      alt={spotlightPlayer.name} 
                      className="h-full w-full object-cover object-top scale-105 drop-shadow-2xl" 
                    />
                  ) : (
                    <Avatar src="" name={spotlightPlayer.name} className="h-32 w-32 rounded-full flex items-center justify-center text-slate-400 bg-purple-900/40" />
                  )}
                </div>

                {/* Angled Name Banner */}
                <div className="relative z-20 bg-black/90 border-y border-purple-500/50 py-2.5 px-4 -mx-6 text-center shadow-lg transform -rotate-1">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase truncate">
                    {spotlightPlayer.name}
                  </h3>
                  <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mt-0.5">
                    <span>{spotlightPlayer.club || "Free Agent"}</span>
                    <span>{spotlightPlayer.country || "Int."}</span>
                  </div>
                </div>

                {/* Stats Grid (Goals, Assists, Rating) */}
                <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 rounded-xl border border-purple-500/30 bg-purple-950/40 p-2.5 text-center backdrop-blur-sm">
                  <div>
                    <span className="text-[9px] font-bold text-purple-300 uppercase">Goals</span>
                    <span className="block text-xs sm:text-sm font-black text-emerald-400">{spotlightPlayer.goals}</span>
                  </div>
                  <div className="border-x border-purple-500/30">
                    <span className="text-[9px] font-bold text-purple-300 uppercase">Assists</span>
                    <span className="block text-xs sm:text-sm font-black text-blue-400">{spotlightPlayer.assists}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-purple-300 uppercase">Form</span>
                    <span className="block text-xs sm:text-sm font-black text-amber-400">
                      {spotlightPlayer.rating ? spotlightPlayer.rating.toFixed(1) : "–"}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="relative z-10 mt-4 pt-3 border-t border-purple-500/30 flex items-center justify-end">
                  <Link
                    to="/players"
                    className="rounded-xl bg-purple-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/40 hover:bg-purple-500 transition-all w-full text-center block"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400 text-xs">
                No player records found in database. Add a player to enable spotlight!
              </div>
            )}
          </div>

          {/* Explore by Competition / Leagues (Static / Non-clickable) */}
          <div className="lg:col-span-2 flex flex-col">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase mb-5 sm:mb-6">🏆 Explore by Competition</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {popularLeagues.map((league, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#111f35]/90 to-[#0d1829] p-5 sm:p-6 shadow-xl"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                      {league.country}
                    </span>
                    <h3 className="mt-3 text-base sm:text-lg font-black text-white">{league.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">Official league federation, clubs & player rosters</p>
                  </div>

                  <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <span className="text-xs font-bold text-slate-300">{league.matches}</span>
                    <span className="text-xs font-bold text-slate-500">Official Federation</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}