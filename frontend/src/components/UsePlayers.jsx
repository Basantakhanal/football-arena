
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL, normalizePlayer } from "./PlayerUtils";

export default function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.players || data.data || [];

      setPlayers(list.map((player, index) =>
        normalizePlayer(player, index)
      ));
    } catch (err) {
      console.error("Player fetching error:", err);
      setError("Unable to load players from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    error,
    refreshPlayers: fetchPlayers
  };
}
