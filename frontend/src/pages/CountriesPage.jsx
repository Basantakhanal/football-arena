
import usePlayers from "../components/UsePlayers";
import { getUniqueCountries } from "../components/PlayerData";
import { Flag } from "../components/PlayerUtils";

export default function CountriesPage() {
  const { players, loading, error } = usePlayers();

  if (loading) return <p className="p-6 text-slate-300">Loading countries...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  const countries = getUniqueCountries(players);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Countries</h1>
        <p className="text-sm text-slate-400">
          Explore players by nationality.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {countries.map(country => {
          const count = players.filter(
            p => p.country?.trim() === country
          ).length;

          return (
            <div
              key={country}
              className="rounded-xl border border-slate-700 bg-[#101c30] p-5"
            >
              <div className="flex items-center gap-3">
                <Flag country={country} w={30} />
                <h2 className="font-semibold text-white">{country}</h2>
              </div>

              <p className="mt-4 text-2xl font-bold text-blue-400">
                {count}
              </p>

              <p className="text-xs text-slate-400">Players</p>
            </div>
          );
        })}
      </div>

      {countries.length === 0 && (
        <p className="text-slate-400">No countries found.</p>
      )}
    </div>
  );
}
