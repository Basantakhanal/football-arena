
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
  "Other",
];

const inputCls =
  "w-full rounded-lg border border-[#1f3150] bg-[#0b1626] px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-[#3b82c4]";

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>

      {children}

      {error && (
        <span className="text-[11px] text-rose-400">
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

      await onPlayerAdded?.();

      setForm({ ...INITIAL });
      setErrors({});
      onClose();

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
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
        className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#243756] bg-[#0d1829] shadow-2xl shadow-black/60"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#1a2b45] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Add player
            </h2>

            <p className="text-xs text-slate-400">
              The card on the right updates as you type.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="h-8 w-8 rounded-full text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <Icon name="x" size={16} className="mx-auto" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">

          {/* FORM FIELDS */}
          <div className="grid grid-cols-2 gap-3.5">

            <Field
              label="Full name"
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
                  <option key={league} value={league}>
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
                  <option key={position} value={position}>
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
                <option value="Active">Active</option>
                <option value="Retired">Retired</option>
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
              label="Club logo URL (optional)"
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

            <p className="mb-2 text-xs font-medium text-slate-400">
              Preview
            </p>

            <div className="rounded-xl border border-[#1c2c45] bg-gradient-to-b from-[#111f35] to-[#0d1829] p-3 shadow-lg">

              <div className="flex gap-3">

                <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#0a1424]">
                  <Avatar
                    key={form.photo_url}
                    src={form.photo_url}
                    name={previewName}
                    className="h-full w-full"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-base font-bold text-white">
                    {previewName}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-200">
                    <ClubBadge
                      key={form.club_logo}
                      src={form.club_logo}
                      name={form.club || "Club"}
                      size={16}
                    />

                    <span className="truncate">
                      {form.club || "Club"}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-300">
                    <Flag
                      country={form.country}
                      w={17}
                    />

                    <span className="truncate">
                      {form.country || "Country"}
                      {form.status === "Retired" ? " - Retired" : ""}
                    </span>
                  </div>

                </div>
              </div>

              {/* PLAYER STATS */}
              <div className="mt-2.5 grid grid-cols-4 text-center">

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
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] text-slate-400">
                      {label}
                    </div>

                    <div
                      className={`text-sm font-semibold ${
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

              <div className="mt-2.5 rounded-md bg-[#2c5f99] py-1.5 text-center text-[13px] font-medium text-white">
                View Details
              </div>

            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Flags load automatically from the country name.
              Without a photo or logo, initials are shown instead.
            </p>

          </div>
        </div>

        {/* SERVER ERROR */}
        {serverError && (
          <p
            role="alert"
            className="mx-6 mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
          >
            {serverError}
          </p>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-2.5 border-t border-[#1a2b45] bg-[#0a1424] px-6 py-3.5">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2c5f99] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3871b3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add player"}
          </button>

        </div>

      </form>
    </div>
  );
}
