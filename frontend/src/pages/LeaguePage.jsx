import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, Avatar, ClubBadge, Flag, normalizePlayer } from "../components/PlayerUtils";

const LEAGUE_META = {
  "Premier League": {
    country: "England",
    code: "ENG",
    matches: "380 Games",
    description: "The top tier of English football, known worldwide for its high intensity, global stars, and dramatic title races.",
    bannerColor: "from-purple-900/40 via-indigo-900/20 to-[#070d19]",
    badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  },
  "La Liga": {
    country: "Spain",
    code: "ESP",
    matches: "380 Games",
    description: "Spain's premier football division featuring tactical brilliance, iconic rivalries like El Clásico, and legendary European champions.",
    bannerColor: "from-amber-900/40 via-red-900/20 to-[#070d19]",
    badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  "Bundesliga": {
    country: "Germany",
    code: "GER",
    matches: "306 Games",
    description: "Germany's top-flight league famous for high-scoring matches, electrifying fan culture, and elite tactical development.",
    bannerColor: "from-red-900/40 via-orange-900/20 to-[#070d19]",
    badgeColor: "border-red-500/40 bg-red-500/10 text-red-400",
  },
  "Serie A": {
    country: "Italy",
    code: "ITA",
    matches: "380 Games",
    description: "Italy's historic top division celebrated for defensive masterclasses, tactical heritage, and prestigious football clubs.",
    bannerColor: "from-blue-900/40 via-cyan-900/20 to-[#070d19]",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  },
};

export default function LeaguePage() {
  const { leagueName } = useParams();
  const navigate = useNavigate();
  const decodedLeague = decodeURIComponent(leagueName || "");

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = LEAGUE_META[decodedLeague] || {
    country: "Global",
    code: "FED",
    matches: "Official Competition",
    description: "Top-tier professional football competition tracked in your custom scouting database.",
    bannerColor: "from-blue-900/40 via-slate-900/20 to-[#070d19]",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  };

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_URL);
        if (data.success) {
          const allPlayers = data.players.map(normalizePlayer);
          const leaguePlayers = allPlayers.filter(
            (p) => (p.league || "").toLowerCase() === decodedLeague.toLowerCase()
          );
          setPlayers(leaguePlayers);
        }
      } catch (err) {
        console.error("Failed to load league players", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeagueData();
  }, [decodedLeague]);

  // Extract unique clubs in this league from database records
  const leagueClubsMap = new Map();
  players.forEach((p) => {
    if (p.club && !leagueClubsMap.has(p.club)) {
      leagueClubsMap.set(p.club, {
        name: p.club,
        logo: p.club_logo,
        playerCount: 1,
      });
    } else if (p.club) {
      leagueClubsMap.get(p.club).playerCount += 1;
    }
  });
  const clubs = Array.from(leagueClubsMap.values());

  const totalGoals = players.reduce((acc, p) => acc + (Number(p.goals) || 0), 0);
  const avgRating = players.length
    ? (players.reduce((acc, p) => acc + (Number(p.rating) || 0), 0) / players.length).toFixed(1)
    : "–";

  return (
    <div className="min-h-screen w-full bg-[#070d19] font-sans text-slate-200 antialiased pb-16">
      
      {/* HEADER BANNER */}
      <div className={`relative border-b border-slate-800/80 bg-gradient-to-b ${meta.bannerColor} px-6 py-12 lg:py-16`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back
              </button>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${meta.badgeColor}`}>
                {meta.country} • {meta.code}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {decodedLeague}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {meta.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-[#0a1424]/90 p-4 backdrop-blur-md shadow-xl shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clubs</div>
              <div className="mt-1 text-xl font-black text-white">{loading ? "..." : clubs.length}</div>
            </div>
            <div className="text-center px-2 border-x border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Players</div>
              <div className="mt-1 text-xl font-black text-blue-400">{loading ? "..." : players.length}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Rat</div>
              <div className="mt-1 text-xl font-black text-amber-400">{loading ? "..." : avgRating}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-12 mt-10">

        {/* CLUBS IN THIS LEAGUE */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <span>🛡️</span> League Teams & Clubs ({clubs.length})
            </h2>
            <Link to="/clubs" className="text-xs font-bold text-blue-400 hover:underline">
              View All Clubs →
            </Link>
          </div>

          {clubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0a1424]/50 p-8 text-center text-xs text-slate-400">
              No registered clubs currently assigned to {decodedLeague} in your database.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {clubs.map((club) => (
                <div
                  key={club.name}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-800/80 bg-[#0d1829] shadow-lg hover:border-slate-700 transition-all"
                >
                  <ClubBadge src={club.logo} name={club.name} size={40} className="mb-3 object-contain" />
                  <h3 className="text-xs font-bold text-white truncate w-full">{club.name}</h3>
                  <span className="mt-1 text-[10px] text-slate-500 font-medium">
                    {club.playerCount} {club.playerCount === 1 ? "Player" : "Players"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LEAGUE PLAYERS ROSTER */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <span>👤</span> League Players Roster ({players.length})
            </h2>
            <Link to="/players" className="text-xs font-bold text-blue-400 hover:underline">
              Open Player Database →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse"></div>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0a1424]/50 p-10 text-center text-xs text-slate-400">
              No players found registered under {decodedLeague}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-[#0d1829] p-4 shadow-lg hover:border-slate-700 transition-all"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <Avatar src={p.photo_url} name={p.name} className="h-full w-full object-cover object-top" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-white truncate">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                      <ClubBadge src={p.club_logo} name={p.club} size={14} />
                      <span className="truncate">{p.club || "Free Agent"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>Gls: <strong className="text-emerald-400">{p.goals}</strong></span>
                      <span>Rat: <strong className="text-amber-400">{p.rating ? p.rating.toFixed(1) : "–"}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}