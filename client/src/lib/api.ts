const API_URL = "/api";

export async function apiPost<T>(path: string, body: object): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error del servidor");
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error del servidor");
  }

  return res.json();
}
