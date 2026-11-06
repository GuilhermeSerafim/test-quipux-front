// Configuration contains only the API location, never credentials.
export function apiUrl(path) {
  const base = process.env.REACT_APP_API_BASE_URL || "";
  const origin = new URL(window.location.origin);
  const url = new URL(`${base.replace(/\/$/, "")}${path}`, origin);
  const local = (value) => ["localhost", "127.0.0.1", "[::1]"].includes(value.hostname);
  if ((origin.protocol !== "https:" && !local(origin)) ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local(url))) ||
      url.username || url.password || url.search || url.hash) {
    throw new Error("Use HTTPS para a aplicação e a API fora do ambiente local.");
  }
  return url.toString();
}

export function basicAuthorization(username, password) {
  if (typeof username !== "string" || typeof password !== "string" ||
      !username.trim() || !password || /[:\r\n]/.test(username) || /[\r\n]/.test(password)) {
    throw new Error("Informe usuário e senha válidos. O usuário não pode conter dois-pontos.");
  }
  const bytes = new TextEncoder().encode(`${username.trim()}:${password}`);
  return `Basic ${btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))}`;
}
