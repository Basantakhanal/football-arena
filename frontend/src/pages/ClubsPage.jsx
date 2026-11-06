
import usePlayers from "../components/UsePlayers";
import { getUniqueClubs, getUniqueLeagues } from "../components/PlayerData";
import { ClubBadge } from "../components/PlayerUtils";

export default function ClubsPage() {
  const { players, loading, error } = usePlayers();

  if (loading) return <p className="p-6 text-slate-300">Loading clubs...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  const clubs = getUniqueClubs(players);
  const leagues = getUniqueLeagues(players);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Clubs & Leagues</h1>
        <p className="text-sm text-slate-400">
          Explore football clubs and leagues from your database.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          Clubs ({clubs.length})
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {clubs.map(club => {
            const clubPlayers = players.filter(
              p => p.club?.trim() === club
            );

            const logo = clubPlayers.find(p => p.club_logo)?.club_logo;

            return (
              <div
                key={club}
                className="rounded-xl border border-slate-700 bg-[#101c30] p-5"
              >
                <div className="flex items-center gap-3">
                  <ClubBadge src={logo} name={club} size={36} />
                  <h3 className="font-semibold text-white">{club}</h3>
                </div>

                <p className="mt-4 text-2xl font-bold text-blue-400">
                  {clubPlayers.length}
                </p>

                <p className="text-xs text-slate-400">Players</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          Leagues ({leagues.length})
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {leagues.map(league => {
            const count = players.filter(
              p => p.league?.trim() === league
            ).length;

            return (
              <div
                key={league}
                className="rounded-xl border border-slate-700 bg-[#101c30] p-5"
              >
                <h3 className="font-semibold text-white">{league}</h3>
                <p className="mt-3 text-2xl font-bold text-blue-400">
                  {count}
                </p>
                <p className="text-xs text-slate-400">Players</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
