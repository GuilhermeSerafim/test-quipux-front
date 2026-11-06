// Supply a stable callback from a real login/session flow. No embedded credentials.
// This module neither stores credentials nor performs network requests.
export function requireAuthorization(getAuthorization) {
  if (typeof getAuthorization !== "function") {
    throw new Error("Authentication provider is not configured.");
  }
  const value = getAuthorization();
  if (typeof value !== "string" || !/^Basic [A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("An authenticated Basic session is required.");
  }
  return value;
}
