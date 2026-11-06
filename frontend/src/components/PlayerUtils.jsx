
import { useState } from "react";

export const API_URL = "http://localhost:5000/api/players";

/* ---------- Flags ---------- */
const ISO = {
  argentina: "ar", brazil: "br", england: "gb-eng", scotland: "gb-sct", wales: "gb-wls",
  france: "fr", germany: "de", italy: "it", norway: "no", portugal: "pt", spain: "es",
  egypt: "eg", netherlands: "nl", belgium: "be", croatia: "hr", uruguay: "uy", poland: "pl",
  senegal: "sn", morocco: "ma", japan: "jp", "south korea": "kr", usa: "us",
  "united states": "us", canada: "ca", mexico: "mx", colombia: "co", ireland: "ie",
  sweden: "se", denmark: "dk", nigeria: "ng", ghana: "gh", turkey: "tr", serbia: "rs",
  switzerland: "ch", austria: "at", ukraine: "ua", algeria: "dz", cameroon: "cm",
  "ivory coast": "ci", nepal: "np", india: "in", chile: "cl", ecuador: "ec", paraguay: "py",
  australia: "au", "south africa": "za", mali: "ml", "dr congo": "cd", greece: "gr",
};

export const flagUrl = (country, explicit) => {
  if (explicit) return explicit;
  const code = ISO[(country || "").trim().toLowerCase()];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

export const COUNTRY_SUGGESTIONS = Object.keys(ISO).map((c) =>
  c.replace(/\b\w/g, (l) => l.toUpperCase())
);

/* ---------- Normalize player data ---------- */
export const normalizePlayer = (p, i = 0) => ({
  id: p.id ?? p._id ?? `local-${i}`,
  name: p.name ?? "Unknown",
  club: p.club ?? "",
  country: p.country ?? "",
  league: p.league ?? "Other",
  position: p.position ?? "",

  age: p.age !== null && p.age !== undefined && p.age !== ""
    ? Number(p.age)
    : null,

  rating: p.rating !== null && p.rating !== undefined && p.rating !== ""
    ? Number(p.rating)
    : 0,

  goals: Number(p.goals) || 0,
  assists: Number(p.assists) || 0,
  minutes: Number(p.minutes) || 0,

  status: p.status ?? "Active",

  // Player image
  photo_url: p.photo_url ?? p.photo ?? p.image ?? p.profile_image ?? "",

  club_logo: p.club_logo ?? "",
  country_flag: p.country_flag ?? "",
});

/* ---------- Age categories ---------- */
export const ageBucket = (age) => {
  if (!age) return null;
  if (age <= 25) return "18-25";
  if (age <= 30) return "26-30";
  if (age <= 35) return "31-35";
  return "36+";
};

/* ---------- Avatar & club badge ---------- */
const initials = (s = "") =>
  s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const hue = (s = "") =>
  [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function Avatar({ src, name, className = "" }) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-extrabold text-white/90 ${className}`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue(name)} 45% 32%), hsl(${hue(name) + 40} 50% 16%))`
      }}
    >
      <span className="text-2xl tracking-tight">{initials(name)}</span>
    </div>
  );
}

export function ClubBadge({ src, name, size = 18 }) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        style={{ width: size, height: size }}
        className="object-contain shrink-0"
      />
    );
  }

  return (
    <span
      style={{
        width: size,
        height: size,
        background: `hsl(${hue(name)} 50% 35%)`,
        fontSize: size * 0.45
      }}
      className="rounded-full shrink-0 flex items-center justify-center font-bold text-white"
    >
      {initials(name)[0]}
    </span>
  );
}

export function Flag({ country, explicit, w = 18 }) {
  const [broken, setBroken] = useState(false);
  const url = flagUrl(country, explicit);

  if (!url || broken) {
    return <span className="text-[11px] leading-none">🌍</span>;
  }

  return (
    <img
      src={url}
      alt={country}
      onError={() => setBroken(true)}
      style={{ width: w, height: w * 0.68 }}
      className="object-cover rounded-[2px] shrink-0 ring-1 ring-white/10"
    />
  );
}

/* ---------- Icons ---------- */
const PATHS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  ball: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v5M15.5 10.5L20 9M14.2 14.5l2.8 3.5M9.8 14.5L7 18M8.5 10.5L4 9",
  trophy: "M8 4h8v5a4 4 0 01-8 0zM8 6H4v2a3 3 0 003 3M16 6h4v2a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4",
  swap: "M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4",
  chart: "M4 19V5M4 19h16M8 15l4-4 3 3 5-6",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2l.4 2.6h4l.4-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01",
  logout: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  chevron: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  check: "M5 12l5 5 9-10",
  x: "M6 6l12 12M18 6L6 18",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  first: "M7 6v12M18 6l-6 6 6 6",
  prev: "M15 6l-6 6 6 6",
  next: "M9 6l6 6-6 6",
  last: "M17 6v12M6 6l6 6-6 6",
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.8, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name] || PATHS.user} />
    </svg>
  );
}
