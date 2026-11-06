import { useEffect, useState } from "react";
import axios from "axios";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("All");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/players", {
        params: { search, position }
      });
      if (response.data.success) {
        setPlayers(response.data.players);
      }
    } catch (err) {
      setError("Could not connect to backend or fetch players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [search, position]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Football Players Directory</h2>

      {/* Controls Bar */}
      <div style={{ display: "flex", gap: "15px", margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search player by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white" }}
        >
          <option value="All">All Positions</option>
          <option value="Forward">Forward</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Defender">Defender</option>
          <option value="Goalkeeper">Goalkeeper</option>
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading players...</p>
      ) : players.length === 0 ? (
        <p style={{ color: "#64748b" }}>No players match your search criteria.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {players.map((p) => (
            <div key={p.id} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px", backgroundColor: "#f8fafc" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>{p.name}</h3>
              <p style={{ margin: "4px 0" }}><strong>Position:</strong> {p.position}</p>
              <p style={{ margin: "4px 0" }}><strong>Club:</strong> {p.club}</p>
              <p style={{ margin: "4px 0" }}><strong>Country:</strong> {p.country}</p>
              <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "8px 0" }} />
              <p style={{ margin: "0", fontSize: "14px", color: "#475569" }}>
                ⚽ Goals: {p.goals} | 🎯 Assists: {p.assists}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}