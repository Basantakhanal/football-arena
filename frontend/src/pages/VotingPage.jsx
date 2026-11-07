import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, Avatar, ClubBadge, Flag, normalizePlayer } from "../components/PlayerUtils";

export default function VotingPage() {
  const [dbPlayers, setDbPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shortlists for featured awards
  const [ballonNominees, setBallonNominees] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-ballon-nominees");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [potsNominees, setPotsNominees] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-pots-nominees");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Timers for featured awards { ballondor: timestamp, season: timestamp }
  const [awardExpirations, setAwardExpirations] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-award-expirations");
      return saved ? JSON.parse(saved) : { ballondor: null, season: null };
    } catch {
      return { ballondor: null, season: null };
    }
  });

  // Custom timer input state for awards
  const [customAwardTimes, setCustomAwardTimes] = useState({ ballondor: "", season: "" });

  // Modal selector state
  const [selectingFor, setSelectingFor] = useState(null);

  // Votes state for featured awards
  const [votes, setVotes] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-votes");
      return saved ? JSON.parse(saved) : { ballondor: null, season: null };
    } catch {
      return { ballondor: null, season: null };
    }
  });

  // Explicit vote counts storage for featured awards
  const [awardVoteCounts, setAwardVoteCounts] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-award-vote-counts");
      return saved ? JSON.parse(saved) : { ballondor: {}, season: {} };
    } catch {
      return { ballondor: {}, season: {} };
    }
  });

  // Custom Poll Votes state
  const [userPollVotes, setUserPollVotes] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-user-poll-votes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom Polls State
  const [polls, setPolls] = useState(() => {
    try {
      const saved = localStorage.getItem("fph-custom-polls");
      return saved ? JSON.parse(saved) : [
        { id: 1, title: "Best Young Wonderkid 2026", options: {}, nomineeIds: [], expiresAt: null },
        { id: 2, title: "Best Playmaker of the Year", options: {}, nomineeIds: [], expiresAt: null }
      ];
    } catch {
      return [];
    }
  });

  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDurationValue, setNewPollDurationValue] = useState("");
  const [newPollDurationUnit, setNewPollDurationUnit] = useState("seconds"); // seconds, minutes, hours, days
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [editingPollId, setEditingPollId] = useState(null);
  const [editingPollTitle, setEditingPollTitle] = useState("");

  // Custom timer input state for polls { [pollId]: { value, unit } }
  const [pollCustomTimes, setPollCustomTimes] = useState({});

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_URL);
        const list = Array.isArray(data) ? data : (data.players || data.data || []);
        const normalized = list.map(normalizePlayer);
        setDbPlayers(normalized);

        if (ballonNominees.length === 0 && normalized.length > 0) {
          const initialIds = normalized.slice(0, 8).map((p) => String(p.id));
          setBallonNominees(initialIds);
          localStorage.setItem("fph-ballon-nominees", JSON.stringify(initialIds));
        }
        if (potsNominees.length === 0 && normalized.length > 0) {
          const initialIds = normalized.slice(0, 8).map((p) => String(p.id));
          setPotsNominees(initialIds);
          localStorage.setItem("fph-pots-nominees", JSON.stringify(initialIds));
        }
      } catch (err) {
        console.error("Failed to load players for voting", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const calculateDynamicExpiry = (val, unit) => {
    const num = parseInt(val, 10);
    if (!num || num <= 0) return null;
    const current = Date.now();
    switch (unit) {
      case "seconds":
        return current + num * 1000;
      case "minutes":
        return current + num * 60 * 1000;
      case "hours":
        return current + num * 3600 * 1000;
      case "days":
        return current + num * 24 * 3600 * 1000;
      default:
        return null;
    }
  };

  const formatCountdown = (targetTime) => {
    if (!targetTime) return null;
    const diff = targetTime - now;
    if (diff <= 0) return "Voting Closed";

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  };

  const setAwardTimerDynamic = (awardKey) => {
    const timeData = customAwardTimes[awardKey];
    if (!timeData || !timeData.value) return;
    const expiry = calculateDynamicExpiry(timeData.value, timeData.unit || "minutes");
    const updated = { ...awardExpirations, [awardKey]: expiry };
    setAwardExpirations(updated);
    localStorage.setItem("fph-award-expirations", JSON.stringify(updated));
  };

  const handleReopenAward = (awardKey) => {
    const updated = { ...awardExpirations, [awardKey]: null };
    setAwardExpirations(updated);
    localStorage.setItem("fph-award-expirations", JSON.stringify(updated));
  };

  const handleClearAllVotes = () => {
    if (window.confirm("Are you sure you want to clear all your votes across all awards and polls?")) {
      setVotes({ ballondor: null, season: null });
      setAwardVoteCounts({ ballondor: {}, season: {} });
      setUserPollVotes({});
      localStorage.removeItem("fph-votes");
      localStorage.removeItem("fph-award-vote-counts");
      localStorage.removeItem("fph-user-poll-votes");
    }
  };

  const handleAwardVote = (category, playerId) => {
    if (awardExpirations[category] && awardExpirations[category] <= now) return;
    
    const targetId = String(playerId);
    const previousVotedId = votes[category] != null ? String(votes[category]) : null;

    if (previousVotedId === targetId) return;

    const currentCounts = { ...(awardVoteCounts[category] || {}) };

    if (previousVotedId && currentCounts[previousVotedId] > 0) {
      currentCounts[previousVotedId] -= 1;
    }

    currentCounts[targetId] = (currentCounts[targetId] || 0) + 1;

    const updatedVotes = { ...votes, [category]: targetId };
    const updatedCountsObj = { ...awardVoteCounts, [category]: currentCounts };

    setVotes(updatedVotes);
    setAwardVoteCounts(updatedCountsObj);

    localStorage.setItem("fph-votes", JSON.stringify(updatedVotes));
    localStorage.setItem("fph-award-vote-counts", JSON.stringify(updatedCountsObj));
  };

  const handleClearAwardVote = (category) => {
    const previousVotedId = votes[category] != null ? String(votes[category]) : null;
    if (!previousVotedId) return;

    const currentCounts = { ...(awardVoteCounts[category] || {}) };
    if (currentCounts[previousVotedId] > 0) {
      currentCounts[previousVotedId] -= 1;
    }

    const updatedVotes = { ...votes, [category]: null };
    const updatedCountsObj = { ...awardVoteCounts, [category]: currentCounts };

    setVotes(updatedVotes);
    setAwardVoteCounts(updatedCountsObj);

    localStorage.setItem("fph-votes", JSON.stringify(updatedVotes));
    localStorage.setItem("fph-award-vote-counts", JSON.stringify(updatedCountsObj));
  };

  const toggleNominee = (target, playerId) => {
    const targetId = String(playerId);

    if (target === "ballondor") {
      const updated = ballonNominees.includes(targetId)
        ? ballonNominees.filter((id) => id !== targetId)
        : [...ballonNominees, targetId];
      setBallonNominees(updated);
      localStorage.setItem("fph-ballon-nominees", JSON.stringify(updated));
    } else if (target === "season") {
      const updated = potsNominees.includes(targetId)
        ? potsNominees.filter((id) => id !== targetId)
        : [...potsNominees, targetId];
      setPotsNominees(updated);
      localStorage.setItem("fph-pots-nominees", JSON.stringify(updated));
    } else if (target && typeof target === "object" && target.pollId) {
      const pollId = target.pollId;
      const updatedPolls = polls.map((poll) => {
        if (poll.id === pollId) {
          const currentList = poll.nomineeIds || [];
          const newList = currentList.includes(targetId)
            ? currentList.filter((id) => id !== targetId)
            : [...currentList, targetId];
          return { ...poll, nomineeIds: newList };
        }
        return poll;
      });
      setPolls(updatedPolls);
      localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
    }
  };

  const handlePollVote = (poll, playerId) => {
    if (poll.expiresAt && poll.expiresAt <= now) return;
    const targetId = String(playerId);
    const previousVotedPlayerId = userPollVotes[poll.id] != null ? String(userPollVotes[poll.id]) : null;

    if (previousVotedPlayerId === targetId) return;

    const updatedPolls = polls.map((p) => {
      if (p.id === poll.id) {
        const counts = { ...p.options };
        if (previousVotedPlayerId && counts[previousVotedPlayerId] > 0) {
          counts[previousVotedPlayerId] -= 1;
        }
        counts[targetId] = (counts[targetId] || 0) + 1;
        return { ...p, options: counts };
      }
      return p;
    });

    const updatedUserPollVotes = { ...userPollVotes, [poll.id]: targetId };
    setPolls(updatedPolls);
    setUserPollVotes(updatedUserPollVotes);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
    localStorage.setItem("fph-user-poll-votes", JSON.stringify(updatedUserPollVotes));
  };

  const handleClearPollVote = (pollId) => {
    const previousVotedPlayerId = userPollVotes[pollId] != null ? String(userPollVotes[pollId]) : null;
    if (!previousVotedPlayerId) return;

    const updatedPolls = polls.map((poll) => {
      if (poll.id === pollId) {
        const counts = { ...poll.options };
        if (counts[previousVotedPlayerId] > 0) {
          counts[previousVotedPlayerId] -= 1;
        }
        return { ...poll, options: counts };
      }
      return poll;
    });

    const updatedUserPollVotes = { ...userPollVotes };
    delete updatedUserPollVotes[pollId];

    setPolls(updatedPolls);
    setUserPollVotes(updatedUserPollVotes);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
    localStorage.setItem("fph-user-poll-votes", JSON.stringify(updatedUserPollVotes));
  };

  const handleSetPollTimerDynamic = (pollId) => {
    const timeData = pollCustomTimes[pollId];
    if (!timeData || !timeData.value) return;
    const expiry = calculateDynamicExpiry(timeData.value, timeData.unit || "minutes");

    const updatedPolls = polls.map((p) => (p.id === pollId ? { ...p, expiresAt: expiry } : p));
    setPolls(updatedPolls);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
  };

  const handleReopenPoll = (pollId) => {
    const updatedPolls = polls.map((p) => (p.id === pollId ? { ...p, expiresAt: null } : p));
    setPolls(updatedPolls);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
  };

  const createPoll = (e) => {
    e.preventDefault();
    if (!newPollTitle.trim()) return;

    const expiry = calculateDynamicExpiry(newPollDurationValue, newPollDurationUnit);

    const newPoll = {
      id: Date.now(),
      title: newPollTitle.trim(),
      options: {},
      nomineeIds: [],
      expiresAt: expiry,
    };

    const updated = [newPoll, ...polls];
    setPolls(updated);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updated));
    setNewPollTitle("");
    setNewPollDurationValue("");
    setShowCreatePoll(false);
  };

  const handleDeletePoll = (pollId) => {
    if (window.confirm("Are you sure you want to delete this community poll?")) {
      const updatedPolls = polls.filter((p) => p.id !== pollId);
      const updatedUserVotes = { ...userPollVotes };
      delete updatedUserVotes[pollId];

      setPolls(updatedPolls);
      setUserPollVotes(updatedUserVotes);
      localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
      localStorage.setItem("fph-user-poll-votes", JSON.stringify(updatedUserVotes));
    }
  };

  const handleSavePollEdit = (pollId) => {
    if (!editingPollTitle.trim()) return;
    const updatedPolls = polls.map((p) => (p.id === pollId ? { ...p, title: editingPollTitle.trim() } : p));
    setPolls(updatedPolls);
    localStorage.setItem("fph-custom-polls", JSON.stringify(updatedPolls));
    setEditingPollId(null);
    setEditingPollTitle("");
  };

  const getSortedNominees = (nomineeIds, category) => {
    const rawList = dbPlayers.filter((p) => nomineeIds.includes(String(p.id)));
    const countsMap = awardVoteCounts[category] || {};

    return [...rawList].sort((a, b) => {
      const countA = countsMap[String(a.id)] || 0;
      const countB = countsMap[String(b.id)] || 0;
      return countB - countA;
    });
  };

  const ballonPlayers = getSortedNominees(ballonNominees, "ballondor");
  const potsPlayers = getSortedNominees(potsNominees, "season");

  return (
    <div className="min-h-screen w-full bg-[#070d19] font-sans text-slate-200 antialiased pb-24">
      
      {/* HEADER BANNER */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] via-[#0b1322] to-[#070d19] px-6 py-12 lg:py-16 text-center relative">
        <div className="absolute top-6 right-6">
          <button
            onClick={handleClearAllVotes}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all shadow-md"
          >
            🗑️ Clear All My Votes
          </button>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 shadow-sm">
          🏆 Fan Awards & Voting Arena
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Live Rankings & Voting Arena
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
           Watch live leaderboards, and view official winners upon expiration.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse"></div>
            <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse"></div>
          </div>
        ) : dbPlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0a1424]/50 p-12 text-center text-slate-400 text-sm">
            No player records found in the database. Please add players first before voting!
          </div>
        ) : (
          <>
            {/* NOMINEE SELECTOR MODAL */}
            {selectingFor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0d1829] p-6 shadow-2xl max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      {selectingFor === "ballondor"
                        ? "Manage Ballon d'Or Shortlist"
                        : selectingFor === "season"
                        ? "Manage Player of the Season Shortlist"
                        : "Manage Community Poll Nominees"}
                    </h3>
                    <button
                      onClick={() => setSelectingFor(null)}
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      Done ✕
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Select or deselect players to include them in this voting shortlist:
                  </p>

                  <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {dbPlayers.map((p) => {
                      const pIdStr = String(p.id);
                      let isIncluded = false;
                      if (selectingFor === "ballondor") {
                        isIncluded = ballonNominees.includes(pIdStr);
                      } else if (selectingFor === "season") {
                        isIncluded = potsNominees.includes(pIdStr);
                      } else if (selectingFor && selectingFor.pollId) {
                        const targetPoll = polls.find((pol) => pol.id === selectingFor.pollId);
                        isIncluded = targetPoll && (targetPoll.nomineeIds || []).includes(pIdStr);
                      }

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleNominee(selectingFor, p.id)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isIncluded
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-slate-800 bg-[#070d19] hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-700 shadow">
                              <Avatar src={p.photo_url} name={p.name} className="h-full w-full object-cover object-top" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white">{p.name}</h4>
                              <span className="text-xs text-slate-400">
                                {p.club || "Free Agent"} • {p.country}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-black px-3.5 py-1.5 rounded-xl ${
                              isIncluded ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isIncluded ? "Nominated ✓" : "+ Add to Shortlist"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* FEATURED AWARDS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Ballon d'Or Ranking & Winner Box */}
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#111f35] to-[#0d1829] p-6 sm:p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      Annual Award ({ballonPlayers.length} Nominees)
                    </span>
                    <button
                      onClick={() => setSelectingFor("ballondor")}
                      className="text-[11px] font-bold text-blue-400 hover:underline bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20"
                    >
                      ⚙️ Edit Shortlist
                    </button>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-black text-white">Ballon d'Or Ranking</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">Rankings update live based on votes.</p>
                        {awardExpirations.ballondor && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              awardExpirations.ballondor <= now
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            ⏱️ {formatCountdown(awardExpirations.ballondor)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Dynamic Custom Timer Input */}
                      <div className="flex items-center gap-1 bg-[#070d19] border border-slate-800 rounded-lg p-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Time"
                          value={customAwardTimes.ballondor?.value || ""}
                          onChange={(e) =>
                            setCustomAwardTimes({
                              ...customAwardTimes,
                              ballondor: { ...(customAwardTimes.ballondor || {}), value: e.target.value }
                            })
                          }
                          className="w-12 bg-transparent text-xs text-white px-1 outline-none text-center"
                        />
                        <select
                          value={customAwardTimes.ballondor?.unit || "minutes"}
                          onChange={(e) =>
                            setCustomAwardTimes({
                              ...customAwardTimes,
                              ballondor: { ...(customAwardTimes.ballondor || {}), unit: e.target.value }
                            })
                          }
                          className="bg-slate-900 text-slate-300 text-[10px] font-bold rounded px-1 py-0.5 outline-none"
                        >
                          <option value="seconds">Secs</option>
                          <option value="minutes">Mins</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                        <button
                          onClick={() => setAwardTimerDynamic("ballondor")}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                        >
                          Set
                        </button>
                      </div>

                      {/* Reopen Button if Closed */}
                      {awardExpirations.ballondor && awardExpirations.ballondor <= now && (
                        <button
                          onClick={() => handleReopenAward("ballondor")}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          🔄 Reopen Voting
                        </button>
                      )}

                      {votes.ballondor && (!awardExpirations.ballondor || awardExpirations.ballondor > now) && (
                        <button
                          onClick={() => handleClearAwardVote("ballondor")}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          Clear Vote
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* WINNER ANNOUNCEMENT BANNER */}
                {awardExpirations.ballondor && awardExpirations.ballondor <= now && ballonPlayers.length > 0 ? (
                  <div className="my-6 rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-amber-500/20 via-[#111f35] to-[#0d1829] p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow">
                      🏆 Official Winner Crowned
                    </div>
                    <div className="h-28 w-28 mx-auto overflow-hidden rounded-2xl border-2 border-amber-400 bg-slate-950 shadow-xl mb-3">
                      {ballonPlayers[0].photo_url ? (
                        <img src={ballonPlayers[0].photo_url} alt={ballonPlayers[0].name} className="h-full w-full object-cover object-top" />
                      ) : (
                        <Avatar src="" name={ballonPlayers[0].name} className="h-full w-full flex items-center justify-center text-slate-500 text-2xl" />
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">{ballonPlayers[0].name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-300">
                      <ClubBadge src={ballonPlayers[0].club_logo} name={ballonPlayers[0].club} size={16} />
                      <span>{ballonPlayers[0].club || "Free Agent"}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 bg-[#070d19]/80 border border-amber-500/30 rounded-xl p-3 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Votes</span>
                        <span className="text-sm font-black text-amber-400">{awardVoteCounts.ballondor?.[String(ballonPlayers[0].id)] || 0}</span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Goals</span>
                        <span className="text-sm font-black text-emerald-400">{ballonPlayers[0].goals}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                        <span className="text-sm font-black text-cyan-400">{ballonPlayers[0].rating ? ballonPlayers[0].rating.toFixed(1) : "–"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Ranked Nominees List */
                  <div className="my-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {ballonPlayers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                        No nominees added yet. Click <strong>Edit Shortlist</strong> above.
                      </div>
                    ) : (
                      ballonPlayers.map((p, idx) => {
                        const isSelected = String(votes.ballondor) === String(p.id);
                        const voteCount = awardVoteCounts.ballondor?.[String(p.id)] || 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleAwardVote("ballondor", p.id)}
                            className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-amber-500 bg-amber-500/10 shadow-lg" 
                                : "border-slate-800 bg-[#0a1424] hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-sm font-black text-amber-400 shrink-0 w-6 text-center">
                                #{idx + 1}
                              </span>
                              <div className="h-20 sm:h-24 w-20 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950 shadow-xl">
                                {p.photo_url ? (
                                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover object-top" />
                                ) : (
                                  <Avatar src="" name={p.name} className="h-full w-full flex items-center justify-center text-slate-500 text-xl font-black" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-black text-white truncate">{p.name}</h3>
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-300">
                                  <ClubBadge src={p.club_logo} name={p.club} size={16} />
                                  <span className="truncate">{p.club || "Free Agent"}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                  <Flag country={p.country} explicit={p.country_flag} w={16} />
                                  <span className="truncate">{p.country || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3">
                              <span className="block text-xs font-black text-amber-400">{voteCount} Votes</span>
                              <span className="block text-[11px] text-emerald-400 font-bold">{p.goals} Gls</span>
                              <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-lg ${isSelected ? "bg-amber-500 text-slate-950 font-black shadow" : "bg-slate-800 text-slate-400"}`}>
                                {isSelected ? "Voted ✓" : "Vote"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                <div className="rounded-xl bg-[#070d19] border border-slate-800 p-3 text-center text-xs font-bold text-slate-300">
                  {awardExpirations.ballondor && awardExpirations.ballondor <= now
                    ? "🔒 Voting is closed. Winner announced above!"
                    : votes.ballondor
                    ? "🎉 Your Ballon d'Or vote has been locked in!"
                    : "👆 Click any nominee above to cast your vote."}
                </div>
              </div>

              {/* 2. Player of the Season Ranking & Winner Box */}
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#111f35] to-[#0d1829] p-6 sm:p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      League Honor ({potsPlayers.length} Nominees)
                    </span>
                    <button
                      onClick={() => setSelectingFor("season")}
                      className="text-[11px] font-bold text-blue-400 hover:underline bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20"
                    >
                      ⚙️ Edit Shortlist
                    </button>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-black text-white">Player of the Season</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">Rankings update live based on votes.</p>
                        {awardExpirations.season && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              awardExpirations.season <= now
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            ⏱️ {formatCountdown(awardExpirations.season)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Dynamic Custom Timer Input */}
                      <div className="flex items-center gap-1 bg-[#070d19] border border-slate-800 rounded-lg p-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Time"
                          value={customAwardTimes.season?.value || ""}
                          onChange={(e) =>
                            setCustomAwardTimes({
                              ...customAwardTimes,
                              season: { ...(customAwardTimes.season || {}), value: e.target.value }
                            })
                          }
                          className="w-12 bg-transparent text-xs text-white px-1 outline-none text-center"
                        />
                        <select
                          value={customAwardTimes.season?.unit || "minutes"}
                          onChange={(e) =>
                            setCustomAwardTimes({
                              ...customAwardTimes,
                              season: { ...(customAwardTimes.season || {}), unit: e.target.value }
                            })
                          }
                          className="bg-slate-900 text-slate-300 text-[10px] font-bold rounded px-1 py-0.5 outline-none"
                        >
                          <option value="seconds">Secs</option>
                          <option value="minutes">Mins</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                        <button
                          onClick={() => setAwardTimerDynamic("season")}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                        >
                          Set
                        </button>
                      </div>

                      {/* Reopen Button if Closed */}
                      {awardExpirations.season && awardExpirations.season <= now && (
                        <button
                          onClick={() => handleReopenAward("season")}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          🔄 Reopen Voting
                        </button>
                      )}

                      {votes.season && (!awardExpirations.season || awardExpirations.season > now) && (
                        <button
                          onClick={() => handleClearAwardVote("season")}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          Clear Vote
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* WINNER ANNOUNCEMENT BANNER */}
                {awardExpirations.season && awardExpirations.season <= now && potsPlayers.length > 0 ? (
                  <div className="my-6 rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-500/20 via-[#111f35] to-[#0d1829] p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow">
                      🏆 Official Winner Crowned
                    </div>
                    <div className="h-28 w-28 mx-auto overflow-hidden rounded-2xl border-2 border-blue-400 bg-slate-950 shadow-xl mb-3">
                      {potsPlayers[0].photo_url ? (
                        <img src={potsPlayers[0].photo_url} alt={potsPlayers[0].name} className="h-full w-full object-cover object-top" />
                      ) : (
                        <Avatar src="" name={potsPlayers[0].name} className="h-full w-full flex items-center justify-center text-slate-500 text-2xl" />
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">{potsPlayers[0].name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-300">
                      <ClubBadge src={potsPlayers[0].club_logo} name={potsPlayers[0].club} size={16} />
                      <span>{potsPlayers[0].club || "Free Agent"}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 bg-[#070d19]/80 border border-blue-500/30 rounded-xl p-3 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Votes</span>
                        <span className="text-sm font-black text-blue-400">{awardVoteCounts.season?.[String(potsPlayers[0].id)] || 0}</span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Goals</span>
                        <span className="text-sm font-black text-emerald-400">{potsPlayers[0].goals}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                        <span className="text-sm font-black text-cyan-400">{potsPlayers[0].rating ? potsPlayers[0].rating.toFixed(1) : "–"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Ranked Nominees List */
                  <div className="my-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {potsPlayers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                        No nominees added yet. Click <strong>Edit Shortlist</strong> above.
                      </div>
                    ) : (
                      potsPlayers.map((p, idx) => {
                        const isSelected = String(votes.season) === String(p.id);
                        const voteCount = awardVoteCounts.season?.[String(p.id)] || 0;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleAwardVote("season", p.id)}
                            className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-blue-500 bg-blue-500/10 shadow-lg" 
                                : "border-slate-800 bg-[#0a1424] hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-sm font-black text-blue-400 shrink-0 w-6 text-center">
                                #{idx + 1}
                              </span>
                              <div className="h-20 sm:h-24 w-20 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950 shadow-xl">
                                {p.photo_url ? (
                                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover object-top" />
                                ) : (
                                  <Avatar src="" name={p.name} className="h-full w-full flex items-center justify-center text-slate-500 text-xl font-black" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-black text-white truncate">{p.name}</h3>
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-300">
                                  <ClubBadge src={p.club_logo} name={p.club} size={16} />
                                  <span className="truncate">{p.club || "Free Agent"}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                  <Flag country={p.country} explicit={p.country_flag} w={16} />
                                  <span className="truncate">{p.country || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3">
                              <span className="block text-xs font-black text-blue-400">{voteCount} Votes</span>
                              <span className="block text-[11px] text-emerald-400 font-bold">{p.goals} Gls</span>
                              <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-lg ${isSelected ? "bg-blue-600 text-white font-black shadow" : "bg-slate-800 text-slate-400"}`}>
                                {isSelected ? "Voted ✓" : "Vote"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                <div className="rounded-xl bg-[#070d19] border border-slate-800 p-3 text-center text-xs font-bold text-slate-300">
                  {awardExpirations.season && awardExpirations.season <= now
                    ? "🔒 Voting is closed. Winner announced above!"
                    : votes.season
                    ? "🎉 Your Player of the Season vote is saved!"
                    : "👆 Click any nominee above to cast your vote."}
                </div>
              </div>

            </div>

            {/* CUSTOM COMMUNITY POLLS SECTION */}
            <section className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-wide uppercase">📊 Community Polls Leaderboards</h2>
                  <p className="text-xs text-slate-400">Poll options automatically rank themselves from #1 downwards based on live votes.</p>
                </div>
                <button
                  onClick={() => setShowCreatePoll(!showCreatePoll)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all self-start sm:self-auto"
                >
                  {showCreatePoll ? "Cancel" : "+ Create New Poll"}
                </button>
              </div>

              {/* Create Poll Box */}
              {showCreatePoll && (
                <form onSubmit={createPoll} className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl max-w-xl space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Create Custom Poll</h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newPollTitle}
                      onChange={(e) => setNewPollTitle(e.target.value)}
                      placeholder="e.g. Best Goalkeeper of the Decade..."
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Duration"
                        value={newPollDurationValue}
                        onChange={(e) => setNewPollDurationValue(e.target.value)}
                        className="w-24 rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                      <select
                        value={newPollDurationUnit}
                        onChange={(e) => setNewPollDurationUnit(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shrink-0"
                      >
                        Publish Poll
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Polls List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {polls.map((poll) => {
                  const totalPollVotes = Object.values(poll.options).reduce((a, b) => a + b, 0);
                  const votedPlayerId = userPollVotes[poll.id] != null ? String(userPollVotes[poll.id]) : null;
                  const isEditing = editingPollId === poll.id;
                  const isClosed = poll.expiresAt && poll.expiresAt <= now;

                  const rawPollPlayers =
                    poll.nomineeIds && poll.nomineeIds.length > 0
                      ? dbPlayers.filter((p) => poll.nomineeIds.includes(String(p.id)))
                      : dbPlayers;

                  const sortedPollPlayers = [...rawPollPlayers].sort((a, b) => {
                    const countA = poll.options[String(a.id)] || 0;
                    const countB = poll.options[String(b.id)] || 0;
                    return countB - countA;
                  });

                  return (
                    <div key={poll.id} className="rounded-2xl border border-slate-800 bg-[#0d1829] p-6 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                              Active Poll
                            </span>
                            {poll.expiresAt && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isClosed
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                }`}
                              >
                                ⏱️ {formatCountdown(poll.expiresAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                              onClick={() => setSelectingFor({ pollId: poll.id })}
                              className="text-[10px] font-bold text-blue-400 hover:underline bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                            >
                              ⚙️ Shortlist ({poll.nomineeIds?.length || "All"})
                            </button>
                            <span className="text-xs text-slate-400 font-semibold">{totalPollVotes} Votes</span>
                            {votedPlayerId && !isClosed && (
                              <button
                                onClick={() => handleClearPollVote(poll.id)}
                                className="text-[10px] font-bold text-rose-400 hover:underline"
                              >
                                Clear
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingPollId(null);
                                } else {
                                  setEditingPollId(poll.id);
                                  setEditingPollTitle(poll.title);
                                }
                              }}
                              className="text-[10px] font-bold text-blue-400 hover:underline"
                            >
                              {isEditing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeletePoll(poll.id)}
                              className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Dynamic Timer Control for Each Poll */}
                        <div className="flex items-center gap-2 my-3 bg-[#070d19] border border-slate-800 p-2 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400">Set Timer:</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Time"
                            value={pollCustomTimes[poll.id]?.value || ""}
                            onChange={(e) =>
                              setPollCustomTimes({
                                ...pollCustomTimes,
                                [poll.id]: { ...(pollCustomTimes[poll.id] || {}), value: e.target.value }
                              })
                            }
                            className="w-14 bg-slate-900 text-xs text-white px-2 py-1 rounded outline-none text-center border border-slate-700"
                          />
                          <select
                            value={pollCustomTimes[poll.id]?.unit || "minutes"}
                            onChange={(e) =>
                              setPollCustomTimes({
                                ...pollCustomTimes,
                                [poll.id]: { ...(pollCustomTimes[poll.id] || {}), unit: e.target.value }
                              })
                            }
                            className="bg-slate-900 text-slate-300 text-[10px] font-bold rounded px-2 py-1 outline-none border border-slate-700"
                          >
                            <option value="seconds">Secs</option>
                            <option value="minutes">Mins</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                          </select>
                          <button
                            onClick={() => handleSetPollTimerDynamic(poll.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded shadow"
                          >
                            Apply
                          </button>

                          {isClosed && (
                            <button
                              onClick={() => handleReopenPoll(poll.id)}
                              className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded"
                            >
                              🔄 Reopen
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex gap-2 my-2">
                            <input
                              type="text"
                              value={editingPollTitle}
                              onChange={(e) => setEditingPollTitle(e.target.value)}
                              className="flex-1 rounded-lg border border-slate-700 bg-[#070d19] px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePollEdit(poll.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-base font-black text-white">{poll.title}</h3>
                        )}
                      </div>

                      {/* POLL WINNER BANNER */}
                      {isClosed && sortedPollPlayers.length > 0 ? (
                        <div className="my-4 rounded-2xl border border-cyan-500 bg-cyan-500/10 p-4 text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded">
                            🏆 Poll Winner Crowned
                          </span>
                          <div className="flex items-center justify-center gap-3 mt-3">
                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-950 border border-cyan-400">
                              <Avatar src={sortedPollPlayers[0].photo_url} name={sortedPollPlayers[0].name} className="h-full w-full object-cover object-top" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-black text-white">{sortedPollPlayers[0].name}</h4>
                              <span className="text-xs text-cyan-300 font-bold">{poll.options[String(sortedPollPlayers[0].id)] || 0} Votes ({totalPollVotes > 0 ? Math.round(((poll.options[String(sortedPollPlayers[0].id)] || 0) / totalPollVotes) * 100) : 0}%)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Ranked Options List */
                        <div className="my-4 space-y-3.5 max-h-72 overflow-y-auto pr-1">
                          {sortedPollPlayers.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                              No nominees selected. Click <strong>⚙️ Shortlist</strong> above.
                            </div>
                          ) : (
                            sortedPollPlayers.map((p, idx) => {
                              const pIdStr = String(p.id);
                              const count = poll.options[pIdStr] || 0;
                              const pct = totalPollVotes > 0 ? Math.round((count / totalPollVotes) * 100) : 0;
                              const isVoted = votedPlayerId === pIdStr;

                              return (
                                <div
                                  key={p.id}
                                  onClick={() => handlePollVote(poll, p.id)}
                                  className={`group relative overflow-hidden rounded-2xl border p-3 sm:p-3.5 transition-all ${
                                    isClosed
                                      ? "opacity-60 cursor-not-allowed border-slate-800 bg-[#070d19]"
                                      : isVoted
                                      ? "border-blue-500 bg-blue-500/10 shadow-md cursor-pointer"
                                      : "border-slate-800 bg-[#070d19] hover:border-slate-700 cursor-pointer"
                                  }`}
                                >
                                  <div
                                    className="absolute inset-0 bg-blue-600/15 transition-all pointer-events-none"
                                    style={{ width: `${pct}%` }}
                                  ></div>

                                  <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="text-xs font-black text-cyan-400 shrink-0 w-5 text-center">
                                        #{idx + 1}
                                      </span>
                                      <div className="h-14 sm:h-16 w-14 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-700 shadow-md">
                                        <Avatar src={p.photo_url} name={p.name} className="h-full w-full object-cover object-top" />
                                      </div>
                                      <div className="min-w-0">
                                        <span className="block text-xs sm:text-sm font-black text-white truncate">
                                          {p.name} {isVoted && "✓"}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate">{p.club || "Free Agent"}</span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0 pl-2">
                                      <span className="text-xs sm:text-sm font-black text-blue-400">{count} votes</span>
                                      <span className="block text-xs text-slate-500 font-semibold">{pct}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 italic text-center">
                        {isClosed
                          ? "🔒 Voting period has ended for this poll. Click Reopen above to continue."
                          : votedPlayerId
                          ? "Click another player to change your vote or use Clear above."
                          : "Click any player card above to cast your vote."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}