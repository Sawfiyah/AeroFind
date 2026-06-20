import { api, setTokens, clearTokens } from "./client";

export async function register(data) {
  // data = { first_name, last_name, email, username, password, password2, phone }
  return api.post("/users/register/", data);
}

export async function login(username, password) {
  const data = await api.post("/users/login/", { username, password });
  setTokens(data.access, data.refresh);
  return data;
}

export async function logout() {
  clearTokens();
}

export async function getMe() {
  return api.get("/users/me/");
}
