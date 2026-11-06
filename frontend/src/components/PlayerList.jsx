import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import AddPlayerModal from "./AddPlayerModal";
import { API_URL, ClubBadge, Flag, normalizePlayer } from "./PlayerUtils";
import { Icon } from "./Icons";
import useWatchlist from "./UseWatchlist";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const DISPLAY = "font-['Barlow_Condensed',ui-sans-serif,sans-serif]";
const HEALTH_URL = API_URL.replace(/\/players\/?$/, "/health");
const PAGE_SIZES = [6, 12, 24, 48];
const POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const POS_CODE = { Forward: "FW", Midfielder: "MF", Defender: "DF", Goalkeeper: "GK" };
const AGE_MIN = 16;
const AGE_MAX = 40;
const EMPTY = { positions: [], league: "", club: "", country: "", status: "", ageMin: AGE_MIN, ageMax: AGE_MAX };
const SAVED_KEY = "fph-saved-search";

const SORTS = [
  ["rating", "Highest rating"],
  ["goals", "Most goals"],
  ["assists", "Most assists"],
  ["contrib", "Goal contributions"],
  ["minutes", "Most minutes"],
  ["age", "Youngest first"],
  ["name", "Name A–Z"],
];
const sorters = {
  rating: (a, b) => b.rating - a.rating,
  goals: (a, b) => b.goals - a.goals,
  assists: (a, b) => b.assists - a.assists,
  contrib: (a, b) => b.goals + b.assists - (a.goals + a.assists),
  minutes: (a, b) => b.minutes - a.minutes,
  age: (a, b) => (a.age || 99) - (b.age || 99),
  name: (a, b) => a.name.localeCompare(b.name),
};

const TABS = [
  ["all", "All players"],
  ["trending", "Trending"],
  ["rising", "Rising stars"],
  ["watchlist", "Watchlist"],
];

/* If the database has no league, work it out from the club so the League filter is useful */
const CLUB_LEAGUE = {
  
  // ================= PREMIER LEAGUE =================
  "arsenal": "Premier League",
  "aston villa": "Premier League",
  "bournemouth": "Premier League",
  "brentford": "Premier League",
  "brighton": "Premier League",
  "brighton and hove albion": "Premier League",
  "chelsea": "Premier League",
  "coventry city": "Premier League",
  "crystal palace": "Premier League",
  "everton": "Premier League",
  "fulham": "Premier League",
  "hull city": "Premier League",
  "ipswich town": "Premier League",
  "leeds united": "Premier League",
  "liverpool": "Premier League",
  "manchester city": "Premier League",
  "man city": "Premier League",
  "manchester united": "Premier League",
  "man utd": "Premier League",
  "newcastle united": "Premier League",
  "newcastle": "Premier League",
  "nottingham forest": "Premier League",
  "sunderland": "Premier League",
  "tottenham": "Premier League",
  "tottenham hotspur": "Premier League",

  // ================= LA LIGA =================
  "real madrid": "La Liga",
  "barcelona": "La Liga",
  "fc barcelona": "La Liga",
  "atletico madrid": "La Liga",
  "atleti": "La Liga",
  "athletic club": "La Liga",
  "athletic bilbao": "La Liga",
  "real sociedad": "La Liga",
  "real betis": "La Liga",
  "sevilla": "La Liga",
  "valencia": "La Liga",
  "villarreal": "La Liga",
  "celta vigo": "La Liga",
  "celta": "La Liga",
  "getafe": "La Liga",
  "osasuna": "La Liga",
  "mallorca": "La Liga",
  "girona": "La Liga",
  "espanyol": "La Liga",
  "deportivo alaves": "La Liga",
  "alaves": "La Liga",
  "elche": "La Liga",
  "levante": "La Liga",
  "rayo vallecano": "La Liga",
  "malaga": "La Liga",
  "racing santander": "La Liga",
  "deportivo la coruna": "La Liga",

  // ================= BUNDESLIGA =================
  "bayern munich": "Bundesliga",
  "bayern": "Bundesliga",
  "borussia dortmund": "Bundesliga",
  "dortmund": "Bundesliga",
  "bayer leverkusen": "Bundesliga",
  "leverkusen": "Bundesliga",
  "rb leipzig": "Bundesliga",
  "leipzig": "Bundesliga",
  "eintracht frankfurt": "Bundesliga",
  "frankfurt": "Bundesliga",
  "vfb stuttgart": "Bundesliga",
  "stuttgart": "Bundesliga",
  "sc freiburg": "Bundesliga",
  "freiburg": "Bundesliga",
  "hoffenheim": "Bundesliga",
  "fc augsburg": "Bundesliga",
  "augsburg": "Bundesliga",
  "mainz": "Bundesliga",
  "union berlin": "Bundesliga",
  "borussia monchengladbach": "Bundesliga",
  "gladbach": "Bundesliga",
  "hamburger sv": "Bundesliga",
  "hamburg": "Bundesliga",
  "werder bremen": "Bundesliga",
  "bremen": "Bundesliga",
  "fc koln": "Bundesliga",
  "koln": "Bundesliga",
  "schalke 04": "Bundesliga",
  "schalke": "Bundesliga",
  "sc paderborn": "Bundesliga",
  "elversberg": "Bundesliga",

  // ================= SERIE A =================
  "juventus": "Serie A",
  "inter milan": "Serie A",
  "inter": "Serie A",
  "ac milan": "Serie A",
  "milan": "Serie A",
  "napoli": "Serie A",
  "as roma": "Serie A",
  "roma": "Serie A",
  "lazio": "Serie A",
  "atalanta": "Serie A",
  "fiorentina": "Serie A",
  "bologna": "Serie A",
  "torino": "Serie A",
  "udinese": "Serie A",
  "genoa": "Serie A",
  "cagliari": "Serie A",
  "como": "Serie A",
  "parma": "Serie A",
  "lecce": "Serie A",
  "sassuolo": "Serie A",
  "monza": "Serie A",
  "venezia": "Serie A",
  "frosinone": "Serie A",

  // ================= LIGUE 1 =================
  "paris saint-germain": "Ligue 1",
  "paris saint germain": "Ligue 1",
  "psg": "Ligue 1",
  "marseille": "Ligue 1",
  "olympique marseille": "Ligue 1",
  "monaco": "Ligue 1",
  "lyon": "Ligue 1",
  "olympique lyon": "Ligue 1",
  "lille": "Ligue 1",
  "nice": "Ligue 1",
  "lens": "Ligue 1",
  "rennes": "Ligue 1",
  "strasbourg": "Ligue 1",
  "toulouse": "Ligue 1",
  "montpellier": "Ligue 1",
  "nantes": "Ligue 1",
  "reims": "Ligue 1",
  "angers": "Ligue 1",
  "auxerre": "Ligue 1",
  "le havre": "Ligue 1",
  "lorient": "Ligue 1",
  "brest": "Ligue 1",
  "paris fc": "Ligue 1",
  "le mans": "Ligue 1",
  "troyes": "Ligue 1",

  // ================= EREDIVISIE =================
  "ajax": "Eredivisie",
  "psv": "Eredivisie",
  "psv eindhoven": "Eredivisie",
  "feyenoord": "Eredivisie",
  "az alkmaar": "Eredivisie",
  "az": "Eredivisie",
  "fc twente": "Eredivisie",
  "twente": "Eredivisie",
  "utrecht": "Eredivisie",
  "fc utrecht": "Eredivisie",
  "heerenveen": "Eredivisie",
  "sc heerenveen": "Eredivisie",
  "nec nijmegen": "Eredivisie",
  "nec": "Eredivisie",
  "go ahead eagles": "Eredivisie",
  "sparta rotterdam": "Eredivisie",
  "heracles almelo": "Eredivisie",
  "pec zwolle": "Eredivisie",
  "willem ii": "Eredivisie",
  "groningen": "Eredivisie",
  "fortuna sittard": "Eredivisie",

  // ================= PRIMEIRA LIGA =================
  "benfica": "Primeira Liga",
  "sporting cp": "Primeira Liga",
  "sporting lisbon": "Primeira Liga",
  "porto": "Primeira Liga",
  "fc porto": "Primeira Liga",
  "braga": "Primeira Liga",
  "sporting braga": "Primeira Liga",
  "vitoria guimaraes": "Primeira Liga",
  "boavista": "Primeira Liga",
  "famalicao": "Primeira Liga",
  "gil vicente": "Primeira Liga",
  "rio ave": "Primeira Liga",
  "moreirense": "Primeira Liga",
  "estoril": "Primeira Liga",
  "casa pia": "Primeira Liga",
  "santa clara": "Primeira Liga",
  "arouca": "Primeira Liga",
  "nacional": "Primeira Liga",

  // ================= SCOTTISH PREMIERSHIP =================
  "celtic": "Scottish Premiership",
  "rangers": "Scottish Premiership",
  "hearts": "Scottish Premiership",
  "aberdeen": "Scottish Premiership",
  "hibernian": "Scottish Premiership",
  "motherwell": "Scottish Premiership",
  "dundee united": "Scottish Premiership",
  "dundee": "Scottish Premiership",
  "st mirren": "Scottish Premiership",
  "ross county": "Scottish Premiership",
  "kilmarnock": "Scottish Premiership",
  "livingston": "Scottish Premiership",

  // ================= TURKISH SUPER LIG =================
  "galatasaray": "Süper Lig",
  "fenerbahce": "Süper Lig",
  "besiktas": "Süper Lig",
  "trabzonspor": "Süper Lig",
  "basaksehir": "Süper Lig",
  "istanbul basaksehir": "Süper Lig",
  "sivasspor": "Süper Lig",
  "kasimpasa": "Süper Lig",
  "antalyaspor": "Süper Lig",
  "alanyaspor": "Süper Lig",
  "goztepe": "Süper Lig",
  "samsunspor": "Süper Lig",
  "kayserispor": "Süper Lig",
  "konyaspor": "Süper Lig",
  "gaziantep": "Süper Lig",
  "adana demirspor": "Süper Lig",

  // ================= SAUDI PRO LEAGUE =================
  "al nassr": "Saudi Pro League",
  "al hilal": "Saudi Pro League",
  "al ittihad": "Saudi Pro League",
  "al ahli": "Saudi Pro League",
  "al shabab": "Saudi Pro League",
  "al ettifaq": "Saudi Pro League",
  "al fateh": "Saudi Pro League",
  "al taawoun": "Saudi Pro League",
  "al fayha": "Saudi Pro League",
  "damac": "Saudi Pro League",
  "al raed": "Saudi Pro League",
  "al khaleej": "Saudi Pro League",
  "al wehda": "Saudi Pro League",
  "al okhdood": "Saudi Pro League",
  "al orubah": "Saudi Pro League",
  "al qadsiah": "Saudi Pro League",
  "neom sc": "Saudi Pro League",

  // ================= MLS =================
  "inter miami": "MLS",
  "la galaxy": "MLS",
  "lafc": "MLS",
  "los angeles fc": "MLS",
  "new york city fc": "MLS",
  "nycfc": "MLS",
  "new york red bulls": "MLS",
  "atlanta united": "MLS",
  "seattle sounders": "MLS",
  "seattle sounders fc": "MLS",
  "portland timbers": "MLS",
  "orlando city": "MLS",
  "orlando city sc": "MLS",
  "columbus crew": "MLS",
  "fc cincinnati": "MLS",
  "philadelphia union": "MLS",
  "austin fc": "MLS",
  "fc dallas": "MLS",
  "houston dynamo": "MLS",
  "sporting kansas city": "MLS",
  "san jose earthquakes": "MLS",
  "colorado rapids": "MLS",
  "real salt lake": "MLS",
  "minnesota united": "MLS",
  "chicago fire": "MLS",
  "new england revolution": "MLS",
  "toronto fc": "MLS",
  "cf montreal": "MLS",
  "vancouver whitecaps": "MLS",
  "charlotte fc": "MLS",
  "nashville sc": "MLS",
  "san diego fc": "MLS",

  // ================= LIGA MX =================
  "club america": "Liga MX",
  "america": "Liga MX",
  "chivas": "Liga MX",
  "guadalajara": "Liga MX",
  "tigres": "Liga MX",
  "tigres uanl": "Liga MX",
  "monterrey": "Liga MX",
  "rayados": "Liga MX",
  "cruz azul": "Liga MX",
  "pumas": "Liga MX",
  "pumas unam": "Liga MX",
  "toluca": "Liga MX",
  "pachuca": "Liga MX",
  "leon": "Liga MX",
  "santos laguna": "Liga MX",
  "atlas": "Liga MX",
  "tijuana": "Liga MX",
  "queretaro": "Liga MX",
  "necaxa": "Liga MX",
  "puebla": "Liga MX",
  "mazatlan": "Liga MX",
  "juarez": "Liga MX",
  "fc juarez": "Liga MX",
  "atletico san luis": "Liga MX",

  // ================= BRAZILIAN SERIE A =================
  "flamengo": "Brasileirão Série A",
  "palmeiras": "Brasileirão Série A",
  "corinthians": "Brasileirão Série A",
  "sao paulo": "Brasileirão Série A",
  "santos": "Brasileirão Série A",
  "gremio": "Brasileirão Série A",
  "internacional": "Brasileirão Série A",
  "atletico mineiro": "Brasileirão Série A",
  "atletico mg": "Brasileirão Série A",
  "cruzeiro": "Brasileirão Série A",
  "botafogo": "Brasileirão Série A",
  "fluminense": "Brasileirão Série A",
  "vasco da gama": "Brasileirão Série A",
  "bahia": "Brasileirão Série A",
  "fortaleza": "Brasileirão Série A",
  "bragantino": "Brasileirão Série A",
  "red bull bragantino": "Brasileirão Série A",
  "athletico paranaense": "Brasileirão Série A",
  "coritiba": "Brasileirão Série A",
  "sport recife": "Brasileirão Série A",

  // ================= ARGENTINE PRIMERA DIVISION =================
  "boca juniors": "Argentine Primera División",
  "river plate": "Argentine Primera División",
  "racing club": "Argentine Primera División",
  "independiente": "Argentine Primera División",
  "san lorenzo": "Argentine Primera División",
  "estudiantes": "Argentine Primera División",
  "lanus": "Argentine Primera División",
  "velez sarsfield": "Argentine Primera División",
  "rosario central": "Argentine Primera División",
  "newells old boys": "Argentine Primera División",
  "huracan": "Argentine Primera División",
  "talleres": "Argentine Primera División",
  "defensa y justicia": "Argentine Primera División",
  "argentinos juniors": "Argentine Primera División",
  "belgrano": "Argentine Primera División",

  // ================= JAPAN J1 LEAGUE =================
  "kawasaki frontale": "J1 League",
  "yokohama f marinos": "J1 League",
  "urawa red diamonds": "J1 League",
  "kashima antlers": "J1 League",
  "gamba osaka": "J1 League",
  "cerezo osaka": "J1 League",
  "vissel kobe": "J1 League",
  "nagoya grampus": "J1 League",
  "fc tokyo": "J1 League",
  "sanfrecce hiroshima": "J1 League",
  "kashiwa reysol": "J1 League",
  "shonan bellmare": "J1 League",
  "albirex niigata": "J1 League",

  // ================= KOREAN K LEAGUE 1 =================
  "ulsan hd": "K League 1",
  "jeonbuk motors": "K League 1",
  "fc seoul": "K League 1",
  "pohang steelers": "K League 1",
  "suwon fc": "K League 1",
  "suwon samsung bluewings": "K League 1",
  "daegu fc": "K League 1",
  "incheon united": "K League 1",
  "jeju united": "K League 1",
  "gangwon fc": "K League 1",
  "gwangju fc": "K League 1",
  "daejeon hana citizen": "K League 1",

};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const titleCase = (s = "") =>
  s.length <= 3 ? s.toUpperCase() : s.toLowerCase().replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());

const enrich = (raw, i) => {
  const p = normalizePlayer(raw, i);
  const league = p.league && p.league !== "Other" ? p.league : CLUB_LEAGUE[p.club.toLowerCase()] || "Other";
  return { ...p, country: titleCase(p.country), league };
};

const initialsOf = (s = "") => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const hueOf = (s = "") => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const fmt = (n) => Number(n).toLocaleString();

const matches = (p, f) => {
  if (f.positions.length && !f.positions.includes(p.position)) return false;
  if (f.league && p.league !== f.league) return false;
  if (f.club && p.club !== f.club) return false;
  if (f.country && p.country !== f.country) return false;
  if (f.status && p.status !== f.status) return false;
  const ageFilterOn = f.ageMin > AGE_MIN || f.ageMax < AGE_MAX;
  if (ageFilterOn && (!p.age || p.age < f.ageMin || p.age > f.ageMax)) return false;
  return true;
};

const pageItems = (cur, total) => {
  const nums = [...new Set([1, 2, cur - 1, cur, cur + 1, total])].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(`gap-${i}`);
    out.push(n);
  });
  return out;
};

const metaLine = (p) => [p.age ? `${p.age} yrs` : null, p.position || null].filter(Boolean).join(" / ") || "Position not set";

/* ------------------------------------------------------------------ */
/*  Small UI pieces                                                    */
/* ------------------------------------------------------------------ */
function SystemStatus() {
  const [state, setState] = useState("checking"); // checking | online | degraded | offline

  const check = useCallback(async () => {
    try {
      const { data } = await axios.get(HEALTH_URL, { timeout: 5000 });
      const db = data.database ?? data.db;
      if (db === undefined) return setState("online");
      setState(db === true || /connected|ok|up/i.test(String(db)) ? "online" : "degraded");
    } catch {
      setState("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [check]);

  // [dot colour, label, text colour, blinks?]
  const cfg = {
    checking: ["bg-amber-400", "Connecting…", "text-amber-300", false],
    online: ["bg-emerald-500", "API Connected (Supabase)", "text-emerald-400", true],
    degraded: ["bg-rose-500", "API up · Database not connected", "text-rose-400", true],
    offline: ["bg-rose-500", "Backend Offline", "text-rose-400", true],
  }[state];

  return (
    <button
      onClick={check}
      title="Click to re-check"
      role="status"
      className="flex items-center gap-3 rounded-lg border border-[#16233a] bg-[#0c1424] px-3 py-1.5 transition-colors hover:border-[#27406b]"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">System status</span>
      <span className={`flex items-center gap-2 text-xs font-semibold ${cfg[2]}`}>
        <span className="relative flex h-2.5 w-2.5">
          {cfg[3] && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${cfg[0]}`} />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg[0]} ${state === "checking" ? "animate-pulse" : ""}`} />
        </span>
        {cfg[1]}
      </span>
    </button>
  );
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="relative rounded-xl border border-[#16233a] bg-[#0c1424] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`${DISPLAY} mt-2 text-[40px] font-semibold leading-none text-white`}>{value}</p>
      <p className="mt-2 text-[11px] text-slate-500">{hint}</p>
      <Icon name={icon} size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
    </div>
  );
}

function FilterSelect({ value, onChange, allLabel, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-[#1a2740] bg-[#0a1120] px-3 py-2.5 pr-8 text-xs text-slate-200 outline-none transition-colors focus:border-blue-500"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => <option key={o} value={o} className="bg-[#0a1120]">{o}</option>)}
      </select>
      <Icon name="chevron" size={14} className="pointer-events-none absolute right-3 top-3 text-slate-500" />
    </div>
  );
}

function AgeRange({ min, max, onChange }) {
  const parse = (v, fallback) => {
    const n = parseInt(String(v).replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? fallback : n;
  };
  const left = ((min - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const right = ((max - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const box = "w-full rounded-lg border border-[#1a2740] bg-[#0a1120] py-2 text-center text-xs text-slate-200 outline-none focus:border-blue-500";
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <input
          aria-label="Minimum age"
          inputMode="numeric"
          className={box}
          value={min}
          onChange={(e) => onChange(Math.min(Math.max(parse(e.target.value, AGE_MIN), AGE_MIN), max), max)}
        />
        <input
          aria-label="Maximum age"
          inputMode="numeric"
          className={box}
          value={max >= AGE_MAX ? `${AGE_MAX}+` : max}
          onChange={(e) => onChange(min, Math.min(Math.max(parse(e.target.value, AGE_MAX), min), AGE_MAX))}
        />
      </div>
      <div className="relative mt-3 h-1 rounded-full bg-[#1a2740]">
        <div className="absolute h-1 rounded-full bg-blue-500" style={{ left: `${left}%`, right: `${100 - right}%` }} />
      </div>
    </div>
  );
}

function CardPhoto({ src, name }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <>
        <img src={src} alt={name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1626] via-transparent to-transparent" />
      </>
    );
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `radial-gradient(circle at 50% 35%, hsl(${hueOf(name)} 45% 28%), #0d1626 78%)` }}
    >
      <span className={`${DISPLAY} text-6xl font-semibold text-white/80`}>{initialsOf(name)}</span>
    </div>
  );
}

const RatingPill = ({ rating }) =>
  rating > 0 ? (
    <span className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
      <Icon name="star" size={11} filled strokeWidth={1} /> {rating.toFixed(1)}
    </span>
  ) : null;

/* ------------------------------------------------------------------ */
/*  Player card (grid) and row (list)                                  */
/* ------------------------------------------------------------------ */
const PlayerCard = memo(function PlayerCard({ p, watched, onWatch, onView }) {
  const club = p.club || (p.status === "Retired" ? "Icon" : "Free agent");
  const code = POS_CODE[p.position];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#16233a] bg-[#0d1626] transition-colors hover:border-[#27406b]">
      <div className="relative h-[132px] overflow-hidden bg-[#101b30]">
        <CardPhoto key={p.photo_url} src={p.photo_url} name={p.name} />
        {code && (
          <span className="absolute left-3 top-3 rounded-md bg-[#0a1120]/80 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-300 backdrop-blur">{code}</span>
        )}
        <button
          onClick={() => onWatch(p.id)}
          aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
          aria-pressed={watched}
          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md backdrop-blur transition-colors
            ${watched ? "bg-blue-600 text-white" : "bg-[#0a1120]/80 text-slate-300 hover:text-white"}`}
        >
          <Icon name="bookmark" size={14} filled={watched} />
        </button>
        <div className="absolute bottom-3 right-3"><RatingPill rating={p.rating} /></div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 title={p.name} className={`${DISPLAY} truncate text-[26px] font-semibold leading-none text-white`}>{p.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
          <ClubBadge src={p.club_logo} name={club} size={14} />
          <span className="truncate">{club}</span>
          <span className="text-slate-600">·</span>
          <Flag country={p.country} explicit={p.country_flag} w={14} />
          <span className="truncate text-slate-400">{p.country || "N/A"}{p.status === "Retired" ? " (Retired)" : ""}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{metaLine(p)}</p>

        <div className="mt-3 grid grid-cols-3 rounded-lg border border-[#16233a] bg-[#0a1120] py-2.5 text-center">
          {[["GOALS", p.goals], ["ASSISTS", p.assists], ["MINS", fmt(p.minutes)]].map(([l, v]) => (
            <div key={l}>
              <div className="text-[9px] font-semibold tracking-widest text-slate-500">{l}</div>
              <div className={`${DISPLAY} text-xl font-semibold leading-tight text-white`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onView(p)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#16315f] py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-[#1d3f7c]"
          >
            View profile <Icon name="arrowUpRight" size={13} />
          </button>
        </div>
      </div>
    </article>
  );
});

const PlayerRow = memo(function PlayerRow({ p, watched, onWatch, onView }) {
  const club = p.club || (p.status === "Retired" ? "Icon" : "Free agent");
  return (
    <article className="flex items-center gap-4 rounded-xl border border-[#16233a] bg-[#0d1626] p-3 transition-colors hover:border-[#27406b]">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#101b30]">
        <CardPhoto key={p.photo_url} src={p.photo_url} name={p.name} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`${DISPLAY} truncate text-xl font-semibold leading-none text-white`}>{p.name}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
          <ClubBadge src={p.club_logo} name={club} size={14} />
          <span className="truncate">{club} · {p.country || "N/A"} · {metaLine(p)}</span>
        </div>
      </div>
      <div className="hidden items-center gap-6 md:flex">
        {[["GOALS", p.goals], ["ASSISTS", p.assists], ["MINS", fmt(p.minutes)]].map(([l, v]) => (
          <div key={l} className="text-center">
            <div className="text-[9px] font-semibold tracking-widest text-slate-500">{l}</div>
            <div className={`${DISPLAY} text-xl font-semibold leading-tight text-white`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="hidden w-14 sm:block"><RatingPill rating={p.rating} /></div>
      <div className="flex items-center gap-2">
        <button onClick={() => onWatch(p.id)} aria-label="Toggle watchlist" aria-pressed={watched}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${watched ? "border-blue-500 bg-blue-600 text-white" : "border-[#1a2740] text-slate-400 hover:text-white"}`}>
          <Icon name="bookmark" size={14} filled={watched} />
        </button>
        <button onClick={() => onCompare(p.id)} aria-label="Toggle comparison" aria-pressed={compared}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${compared ? "border-blue-500 bg-blue-600/20 text-blue-300" : "border-[#1a2740] text-slate-400 hover:text-white"}`}>
          <Icon name={compared ? "check" : "plus"} size={14} />
        </button>
        <button onClick={() => onView(p)} className="flex items-center gap-1.5 rounded-lg bg-[#16315f] px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-[#1d3f7c]">
          View profile <Icon name="arrowUpRight" size={13} />
        </button>
      </div>
    </article>
  );
});

/* ------------------------------------------------------------------ */
/*  Modals                                                             */
/* ------------------------------------------------------------------ */
function useEscape(onClose) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
}

function DetailsModal({ p, onClose }) {
  useEscape(onClose);
  const rows = [
    ["Position", p.position || "–"], ["League", p.league || "–"], ["Age", p.age || "–"], ["Status", p.status],
    ["Goals", p.goals], ["Assists", p.assists], ["Rating", p.rating ? p.rating.toFixed(1) : "–"], ["Minutes", fmt(p.minutes)],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#1d2c47] bg-[#0d1626] shadow-2xl">
        <div className="relative h-44 overflow-hidden bg-[#101b30]">
          <CardPhoto key={p.photo_url} src={p.photo_url} name={p.name} />
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a1120]/80 text-slate-300 hover:text-white">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="px-6 pb-2 pt-4">
          <h2 className={`${DISPLAY} text-4xl font-semibold leading-none text-white`}>{p.name}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <ClubBadge src={p.club_logo} name={p.club} size={16} />
            {p.club || "Free agent"} <span className="text-slate-600">·</span>
            <Flag country={p.country} explicit={p.country_flag} w={16} /> {p.country || "N/A"}
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-px bg-[#16233a] sm:grid-cols-4">
          {rows.map(([k, v]) => (
            <div key={k} className="bg-[#0d1626] px-5 py-3.5">
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{k}</dt>
              <dd className={`${DISPLAY} mt-0.5 text-2xl font-semibold text-white`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function CompareModal({ list, onClose }) {
  useEscape(onClose);
  const rows = [
    ["Club", (p) => p.club || "–"], ["Country", (p) => p.country || "–"], ["League", (p) => p.league],
    ["Position", (p) => p.position || "–"], ["Age", (p) => p.age || "–"],
    ["Goals", (p) => p.goals, "goals"], ["Assists", (p) => p.assists, "assists"],
    ["Rating", (p) => (p.rating ? p.rating.toFixed(1) : "–"), "rating"], ["Minutes", (p) => fmt(p.minutes), "minutes"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-x-auto rounded-2xl border border-[#1d2c47] bg-[#0d1626] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#16233a] px-6 py-4">
          <h2 className={`${DISPLAY} text-2xl font-semibold text-white`}>Compare players</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white"><Icon name="x" size={18} /></button>
        </div>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr>
              <th className="w-28" />
              {list.map((p) => (
                <th key={p.id} className={`${DISPLAY} px-4 py-3 text-left text-xl font-semibold text-white`}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get, key]) => {
              const best = key ? Math.max(...list.map((p) => p[key])) : null;
              return (
                <tr key={label} className="border-t border-[#16233a]">
                  <td className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</td>
                  {list.map((p) => (
                    <td key={p.id} className={`px-4 py-2.5 ${key && best > 0 && p[key] === best ? "font-bold text-emerald-400" : "text-slate-200"}`}>{get(p)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function PlayerList() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "all";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(params.get("q") || "");
  const dSearch = useDeferredValue(search);
  const [draft, setDraft] = useState(EMPTY);     // what the filter panel is showing
  const [applied, setApplied] = useState(EMPTY); // what is actually filtering (after "Apply filters")
  const [sort, setSort] = useState("rating");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [watch, toggleWatch] = useWatchlist();

  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "null"); } catch { return null; }
  });
  const topRef = useRef(null);

  /* Global search box in the top bar sends ?q=… */
  const qParam = params.get("q");
  useEffect(() => {
    if (qParam !== null) setSearch(qParam);
  }, [qParam]);

 
const fetchPlayers = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const { data } = await axios.get(API_URL);

    console.log("PLAYER API RESPONSE:", data);

    // Your API returns a direct array, not { success, players }
    const playerData = Array.isArray(data)
      ? data
      : Array.isArray(data?.players)
        ? data.players
        : [];

    console.log("FIRST PLAYER:", playerData[0]);

    setPlayers(playerData.map(enrich));

  } catch (err) {
    console.error("PLAYER FETCH ERROR:", err);

    setError(
      "Couldn't reach the server. Check that the backend is running on port 5000."
    );
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  /* Options + counts for the filter panel and the stat cards */
  const info = useMemo(() => {
    const leagues = new Map(), clubs = new Map(), countries = new Map(), pos = {};
    const bump = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);
    players.forEach((p) => {
      bump(leagues, p.league); bump(clubs, p.club); bump(countries, p.country);
      if (p.position) pos[p.position] = (pos[p.position] || 0) + 1;
    });
    const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const realLeagues = sorted(leagues).filter((l) => l !== "Other");
    return {
      leagues: sorted(leagues), clubs: sorted(clubs), countries: sorted(countries),
      leagueCount: realLeagues.length || leagues.size, posCounts: pos,
    };
  }, [players]);

  const filtered = useMemo(() => {
    const q = dSearch.trim().toLowerCase();
    return players
      .filter((p) => {
        if (q && !`${p.name} ${p.club} ${p.country}`.toLowerCase().includes(q)) return false;
        if (tab === "watchlist" && !watch.includes(p.id)) return false;
        if (tab === "rising" && !(p.age && p.age <= 23)) return false;
        return matches(p, applied);
      })
      .sort(sorters[sort]);
  }, [players, dSearch, tab, watch, applied, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const visible = useMemo(() => filtered.slice(startIdx, startIdx + pageSize), [filtered, startIdx, pageSize]);

  useEffect(() => setPage(1), [dSearch, applied, sort, tab, pageSize]);

  const goPage = (n) => {
    setPage(Math.min(totalPages, Math.max(1, n)));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setTab = (t) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (t === "all") next.delete("tab"); else next.set("tab", t);
      return next;
    }, { replace: true });
    if (t === "trending") setSort("contrib");
    if (t === "rising") setSort("rating");
  };

  const setDraftField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const togglePosition = (pos) =>
    setDraft((d) => ({ ...d, positions: d.positions.includes(pos) ? d.positions.filter((x) => x !== pos) : [...d.positions, pos] }));
  const applyFilters = () => setApplied(draft);
  const resetAll = () => { setDraft(EMPTY); setApplied(EMPTY); setSearch(""); };
  const setStatus = (v) => { setDraft((d) => ({ ...d, status: v })); setApplied((a) => ({ ...a, status: v })); };

  const saveSearch = () => {
    const snapshot = { filters: applied, search, sort };
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(snapshot)); } catch { /* ignore */ }
    setSaved(snapshot);
  };
  const restoreSearch = () => {
    if (!saved) return;
    setDraft(saved.filters); setApplied(saved.filters); setSearch(saved.search || ""); setSort(saved.sort || "rating");
  };

 
  const openDetails = useCallback((p) => setSelected(p), []);
  const closeDetails = useCallback(() => setSelected(null), []);
  const closeCompare = useCallback(() => setShowCompare(false), []);

  const filtersActive = JSON.stringify(applied) !== JSON.stringify(EMPTY) || search !== "";
  const Card = view === "grid" ? PlayerCard : PlayerRow;

  return (
    <div className="w-full px-6 pb-10 pt-6 lg:px-8">
      {/* HERO */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">The game, in greater detail</p>
          <h1 className={`${DISPLAY} mt-2 text-5xl font-semibold leading-none text-white sm:text-[56px]`}>Find your next favourite player.</h1>
          <p className="mt-3 text-xs text-slate-400">Explore the talent. Read the numbers. Build your own view of the game.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#27406b] px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#12203a]"
          >
            <Icon name="plus" size={14} /> Add player
          </button>
          <button
            onClick={() => setTab("watchlist")}
            className="flex items-center gap-2 rounded-lg bg-[#2d6bf3] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-[#4a82ff]"
          >
            <Icon name="bookmark" size={14} /> My watchlist
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{watch.length}</span>
          </button>
        </div>
      </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* FILTER PANEL */}
        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-[#16233a] bg-[#0c1424] p-4">
            <div className="flex items-center justify-between border-b border-[#16233a] pb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Icon name="sliders" size={15} /> Filters</h2>
              <button onClick={resetAll} className="text-[11px] font-medium text-blue-400 hover:text-blue-300">Reset all</button>
            </div>

            <fieldset className="mt-4">
              <legend className="mb-2 text-xs font-semibold text-slate-200">Position</legend>
              <div className="space-y-2.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300">
                  <input type="checkbox" checked={draft.positions.length === 0} onChange={() => setDraftField("positions", [])} className="h-4 w-4 accent-blue-500" />
                  <span className="flex-1">All positions</span>
                  <span className="text-[11px] text-slate-500">{fmt(players.length)}</span>
                </label>
                {POSITIONS.map((pos) => (
                  <label key={pos} className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300">
                    <input type="checkbox" checked={draft.positions.includes(pos)} onChange={() => togglePosition(pos)} className="h-4 w-4 accent-blue-500" />
                    <span className="flex-1">{pos}</span>
                    <span className="text-[11px] text-slate-500">{fmt(info.posCounts[pos] || 0)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 space-y-4 border-t border-[#16233a] pt-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-200">League</p>
                <FilterSelect value={draft.league} onChange={(v) => setDraftField("league", v)} allLabel="All leagues" options={info.leagues} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-200">Club</p>
                <FilterSelect value={draft.club} onChange={(v) => setDraftField("club", v)} allLabel="All clubs" options={info.clubs} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-200">Nationality</p>
                <FilterSelect value={draft.country} onChange={(v) => setDraftField("country", v)} allLabel="All countries" options={info.countries} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-200">Age range</p>
                <AgeRange min={draft.ageMin} max={draft.ageMax} onChange={(a, b) => setDraft((d) => ({ ...d, ageMin: a, ageMax: b }))} />
              </div>
            </div>

            <button
              onClick={applyFilters}
              className="mt-5 w-full rounded-lg bg-[#2d6bf3] py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-[#4a82ff]"
            >
              Apply filters
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#16233a] bg-[#0c1424] p-3.5">
            <button onClick={saveSearch} className="flex flex-1 items-center gap-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#12203a] text-blue-400"><Icon name="bookmark" size={14} /></span>
              <span>
                <span className="block text-xs font-semibold text-slate-100">Keep your discoveries.</span>
                <span className="block text-[11px] text-slate-500">{saved ? "Saved · tap to overwrite" : "Save this search"}</span>
              </span>
            </button>
            {saved && <button onClick={restoreSearch} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300">Restore</button>}
          </div>
        </aside>

        {/* RESULTS */}
        <section className="min-w-0" ref={topRef}>
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#16233a]">
            <div className="flex gap-6" role="tablist">
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-xs font-medium transition-colors
                    ${tab === key ? "border-blue-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  {label}
                  {key === "all" && <span className="text-[10px] text-slate-500">{fmt(players.length)}</span>}
                  {key === "watchlist" && watch.length > 0 && <span className="text-[10px] text-slate-500">{watch.length}</span>}
                </button>
              ))}
            </div>
            <label className="-mt-2 flex items-center gap-2 text-[11px] text-slate-500">
              Status
              <select
                value={applied.status}
                onChange={(e) => setStatus(e.target.value)}
                className="cursor-pointer rounded-md border border-[#1a2740] bg-[#0a1120] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">All</option>
                <option>Active</option>
                <option>Retired</option>
              </select>
            </label>
          </div>

          {/* Search / sort / view */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3.5 top-3 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by player name…"
                className="w-full rounded-lg border border-[#16233a] bg-[#0c1424] py-2.5 pl-10 pr-9 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-blue-500"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-3 text-slate-500 hover:text-white"><Icon name="x" size={14} /></button>
              )}
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-[#16233a] bg-[#0c1424] pl-3 text-xs text-slate-500">
              Sort by:
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="cursor-pointer bg-transparent py-2.5 pr-3 text-slate-100 outline-none">
                {SORTS.map(([k, l]) => <option key={k} value={k} className="bg-[#0a1120]">{l}</option>)}
              </select>
            </label>
            <div className="flex overflow-hidden rounded-lg border border-[#16233a] bg-[#0c1424]">
              {[["grid", "grid"], ["list", "list"]].map(([k, icon]) => (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  aria-label={`${k} view`}
                  aria-pressed={view === k}
                  className={`flex h-[38px] w-10 items-center justify-center transition-colors ${view === k ? "bg-[#16315f] text-blue-300" : "text-slate-500 hover:text-slate-200"}`}
                >
                  <Icon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              {filtered.length === 0 ? "Showing 0 players" : `Showing ${fmt(startIdx + 1)}–${fmt(Math.min(startIdx + pageSize, filtered.length))} of ${fmt(filtered.length)} players`}
            </span>
            <span className="uppercase tracking-wider">Live roster <span className="mx-1 text-slate-700">·</span> Synced from your database</span>
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <span>{error}</span>
              <button onClick={fetchPlayers} className="font-bold underline hover:text-white">Try again</button>
            </div>
          )}

          {/* Cards */}
          <div className="mt-3">
            {loading ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
                {Array.from({ length: pageSize > 12 ? 12 : pageSize }).map((_, n) => (
                  <div key={n} className="h-[330px] animate-pulse rounded-2xl border border-[#16233a] bg-[#0c1424]" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-dashed border-[#1d2c47] bg-[#0c1424] py-16 text-center">
                <p className={`${DISPLAY} text-2xl font-semibold text-white`}>
                  {players.length === 0 ? "No players yet" : tab === "watchlist" ? "Your watchlist is empty" : "No players match these filters"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {players.length === 0 ? "Add your first player to get started." : tab === "watchlist" ? "Tap the bookmark on any player to save them here." : "Remove a filter or try a different name."}
                </p>
                <button
                  onClick={() => (players.length === 0 ? setIsModalOpen(true) : tab === "watchlist" ? setTab("all") : resetAll())}
                  className="mt-5 rounded-lg bg-[#2d6bf3] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4a82ff]"
                >
                  {players.length === 0 ? "Add player" : tab === "watchlist" ? "Browse players" : filtersActive ? "Clear filters" : "Reset"}
                </button>
              </div>
            ) : (
              <div className={view === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4" : "flex flex-col gap-2.5"}>
                {visible.map((p) => (
                 <Card
                    key={p.id}
                    p={p}
                    watched={watch.includes(p.id)}
                    onWatch={toggleWatch}
                    onView={openDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 grid items-center gap-3 text-xs text-slate-500 md:grid-cols-3">
            <span>Page {safePage} of {fmt(totalPages)}</span>
            <div className="flex items-center justify-center gap-1.5">
              <button onClick={() => goPage(safePage - 1)} disabled={safePage === 1} aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#16233a] bg-[#0c1424] text-slate-300 enabled:hover:border-[#27406b] disabled:opacity-30">
                <Icon name="prev" size={14} />
              </button>
              {pageItems(safePage, totalPages).map((n) =>
                typeof n === "number" ? (
                  <button
                    key={n}
                    onClick={() => goPage(n)}
                    aria-current={n === safePage ? "page" : undefined}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors
                      ${n === safePage ? "bg-[#2d6bf3] text-white" : "border border-[#16233a] bg-[#0c1424] text-slate-300 hover:border-[#27406b]"}`}
                  >
                    {fmt(n)}
                  </button>
                ) : (
                  <span key={n} className="px-1 text-slate-600">…</span>
                )
              )}
              <button onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages} aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#16233a] bg-[#0c1424] text-slate-300 enabled:hover:border-[#27406b] disabled:opacity-30">
                <Icon name="next" size={14} />
              </button>
            </div>
            <label className="flex items-center gap-2 md:justify-end">
              Players per page
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="cursor-pointer rounded-md border border-[#16233a] bg-[#0c1424] px-2 py-1 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>

          {/* Footer: brand left · system status right */}
          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#16233a] pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              FootballArena <span className="mx-1">/</span> A closer look at the game
            </span>
            <SystemStatus />
          </footer>
        </section>
      </div>

      {/* Compare tray */}
    

      <AddPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlayerAdded={fetchPlayers}
        existingClubs={info.clubs}
        existingLeagues={info.leagues}
      />
      {selected && <DetailsModal p={selected} onClose={closeDetails} />}
      
    </div>
  );
}