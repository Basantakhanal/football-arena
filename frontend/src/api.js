
export const API_URL = "http://127.0.0.1:5000/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || `Server error: ${response.status}`
    );
  }

  return data;
}

export async function getPlayers() {
  const response = await fetch(`${API_URL}/players`);
  return handleResponse(response);
}

export async function addPlayer(data) {
  const response = await fetch(`${API_URL}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return handleResponse(response);
}

export async function updatePlayer(id, data) {
  const response = await fetch(`${API_URL}/players/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return handleResponse(response);
}

export async function deletePlayer(id) {
  const response = await fetch(`${API_URL}/players/${id}`, {
    method: "DELETE"
  });

  return handleResponse(response);
}
