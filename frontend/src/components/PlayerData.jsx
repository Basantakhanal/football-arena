
export const getUniqueClubs = (players) => {
  return [...new Set(
    players.map(p => p.club?.trim()).filter(Boolean)
  )].sort();
};

export const getUniqueLeagues = (players) => {
  return [...new Set(
    players.map(p => p.league?.trim()).filter(Boolean)
  )].sort();
};

export const getUniqueCountries = (players) => {
  return [...new Set(
    players.map(p => p.country?.trim()).filter(Boolean)
  )].sort();
};
