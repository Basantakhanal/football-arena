import { useEffect, useState } from "react";
import axios from "axios";

import {
  API_URL,
  Avatar,
  ClubBadge,
  COUNTRY_SUGGESTIONS,
  Flag,
  Icon,
} from "./PlayerUtils";

const INITIAL = {
  name: "",
  club: "",
  league: "",
  country: "",
  position: "Forward",
  age: "",
  status: "Active",
  goals: "",
  assists: "",
  rating: "",
  minutes: "",
  photo_url: "",
  club_logo: "",
};

const POSITIONS = [
  "Forward",
  "Midfielder",
  "Defender",
  "Goalkeeper",
];

const LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "MLS",
  "Saudi Pro League",
  "none",
  "Other",
];

const inputCls =
  "w-full rounded-xl border border-slate-800 bg-[#0b1626] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      {children}

      {error && (
        <span className="text-[11px] font-medium text-rose-400">
          {error}
        </span>
      )}
    </label>
  );
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onPlayerAdded,
  existingClubs = [],
  existingLeagues = [],
}) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (key) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  // ESCAPE KEY
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  const leagues = [
    ...new Set([
      ...LEAGUES.filter((l) => l !== "Other"),
      ...existingLeagues,
      "Other",
    ]),
  ];

  // VALIDATION
  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Enter the player's name.";
    }

    if (!form.country.trim()) {
      e.country = "Enter a country.";
    }

    if (
      form.age !== "" &&
      (!Number.isFinite(Number(form.age)) ||
        Number(form.age) < 15 ||
        Number(form.age) > 50)
    ) {
      e.age = "Age must be between 15 and 50.";
    }

    if (
      form.rating !== "" &&
      (!Number.isFinite(Number(form.rating)) ||
        Number(form.rating) < 0 ||
        Number(form.rating) > 10)
    ) {
      e.rating = "Rating must be between 0 and 10.";
    }

    ["goals", "assists", "minutes"].forEach((key) => {
      if (
        form[key] !== "" &&
        (!Number.isFinite(Number(form[key])) ||
          Number(form[key]) < 0)
      ) {
        e[key] = "Enter a valid non-negative number.";
      }
    });

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // SUBMIT
  const submit = async (ev) => {
    ev.preventDefault();

    if (saving || !validate()) return;

    setSaving(true);
    setServerError("");

    try {
      const payload = {
        ...form,

        name: form.name.trim(),
        club: form.club.trim(),
        country: form.country.trim(),

        age: form.age === "" ? null : Number(form.age),

        goals: Number(form.goals) || 0,
        assists: Number(form.assists) || 0,
        rating: Number(form.rating) || 0,
        minutes: Number(form.minutes) || 0,
      };

      const { data } = await axios.post(API_URL, payload);

      if (data?.success === false) {
        throw new Error(data.message || "Unable to save player.");
      }

      onClose();

      // Small commit-delay buffer to ensure database transaction finishes writing
      setTimeout(() => {
        onPlayerAdded?.();
      }, 150);

      setForm({ ...INITIAL });
      setErrors({});

    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        err.message ||
        "Couldn't save the player. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const previewName = form.name || "Player Name";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        noValidate
        className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1829] shadow-2xl shadow-black/80"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0a1424]">
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Add Player
            </h2>

            <p className="text-xs text-slate-400">
              The card on the right updates instantly as you type.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Icon name="x" size={16} className="mx-auto" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">

          {/* FORM FIELDS */}
          <div className="grid grid-cols-2 gap-4">

            <Field
              label="Full Name"
              error={errors.name}
              className="col-span-2"
            >
              <input
                className={inputCls}
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Lamine Yamal"
                autoFocus
              />
            </Field>

            <Field label="Club">
              <input
                className={inputCls}
                list="club-list"
                value={form.club}
                onChange={set("club")}
                placeholder="e.g. Barcelona"
              />

              <datalist id="club-list">
                {existingClubs.map((club) => (
                  <option key={club} value={club} />
                ))}
              </datalist>
            </Field>

            <Field label="League">
              <select
                className={inputCls}
                value={form.league}
                onChange={set("league")}
              >
                <option value="">Select league</option>

                {leagues.map((league) => (
                  <option key={league} value={league} className="bg-[#0c1626]">
                    {league}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Country"
              error={errors.country}
            >
              <input
                className={inputCls}
                list="country-list"
                value={form.country}
                onChange={set("country")}
                placeholder="e.g. Spain"
              />

              <datalist id="country-list">
                {COUNTRY_SUGGESTIONS.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </Field>

            <Field label="Position">
              <select
                className={inputCls}
                value={form.position}
                onChange={set("position")}
              >
                {POSITIONS.map((position) => (
                  <option key={position} value={position} className="bg-[#0c1626]">
                    {position}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Age" error={errors.age}>
              <input
                type="number"
                min="15"
                max="50"
                className={inputCls}
                value={form.age}
                onChange={set("age")}
                placeholder="18"
              />
            </Field>

            <Field label="Status">
              <select
                className={inputCls}
                value={form.status}
                onChange={set("status")}
              >
                <option value="Active" className="bg-[#0c1626]">Active</option>
                <option value="Retired" className="bg-[#0c1626]">Retired</option>
              </select>
            </Field>

            {/* STATISTICS */}
            <div className="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <Field label="Goals" error={errors.goals}>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.goals}
                  onChange={set("goals")}
                  placeholder="0"
                />
              </Field>

              <Field label="Assists" error={errors.assists}>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.assists}
                  onChange={set("assists")}
                  placeholder="0"
                />
              </Field>

              <Field label="Rating" error={errors.rating}>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className={inputCls}
                  value={form.rating}
                  onChange={set("rating")}
                  placeholder="7.5"
                />
              </Field>

              <Field label="Minutes" error={errors.minutes}>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.minutes}
                  onChange={set("minutes")}
                  placeholder="0"
                />
              </Field>

            </div>

            {/* IMAGE URLS */}
            <Field
              label="Photo URL (optional)"
              className="col-span-2"
            >
              <input
                type="url"
                className={inputCls}
                value={form.photo_url}
                onChange={set("photo_url")}
                placeholder="https://.../player.png"
              />
            </Field>

            <Field
              label="Club Logo URL (optional)"
              className="col-span-2"
            >
              <input
                type="url"
                className={inputCls}
                value={form.club_logo}
                onChange={set("club_logo")}
                placeholder="https://.../logo.png"
              />
            </Field>

          </div>

          {/* LIVE PREVIEW */}
          <div className="self-start md:sticky md:top-0">

            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Card Preview
            </p>

            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#111f35] to-[#0d1829] p-3 shadow-xl">

              <div className="flex gap-3">

                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                  <Avatar
                    key={form.photo_url}
                    src={form.photo_url}
                    name={previewName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">

                  <h3 className="truncate text-[15px] font-black tracking-tight text-white">
                    {previewName}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-[13px] font-medium text-slate-200">
                    <ClubBadge
                      key={form.club_logo}
                      src={form.club_logo}
                      name={form.club || "Club"}
                      size={18}
                      className="object-contain"
                    />

                    <span className="truncate">
                      {form.club || "Club"}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-slate-400">
                    <Flag
                      country={form.country}
                      w={18}
                      className="rounded-[2px] object-cover shadow-sm"
                    />

                    <span className="truncate">
                      {form.country || "Country"}
                      {form.status === "Retired" ? " • Retired" : ""}
                    </span>
                  </div>

                </div>
              </div>

              {/* PLAYER STATS */}
              <div className="mt-4 grid grid-cols-4 rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-center shadow-inner">

                {[
                  ["Gls", form.goals || 0],
                  ["Ast", form.assists || 0],
                  [
                    "Rat",
                    form.rating
                      ? Number(form.rating).toFixed(1)
                      : "–",
                  ],
                  ["Mins", form.minutes || 0],
                ].map(([label, value], idx) => (
                  <div key={label} className={idx > 0 ? "border-l border-slate-800/60" : ""}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {label}
                    </div>

                    <div
                      className={`mt-0.5 text-[13px] font-black tabular-nums ${
                        label === "Rat"
                          ? "text-emerald-400"
                          : "text-white"
                      }`}
                    >
                      {value}
                    </div>
                  </div>
                ))}

              </div>

              <div className="mt-3.5 rounded-xl bg-blue-600/90 py-2 text-center text-[13px] font-bold text-white shadow-md">
                View Details
              </div>

            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Flags load automatically from the country name. Without a photo or logo, initials are shown instead.
            </p>

          </div>
        </div>

        {/* SERVER ERROR */}
        {serverError && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300 shadow-md"
          >
            {serverError}
          </p>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-slate-800 bg-[#0a1424] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {saving ? "Saving..." : "Add Player"}
          </button>

        </div>

      </form>
    </div>
  );
}