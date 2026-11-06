import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiUrl, basicAuthorization } from "./api";
import { requireAuthorization } from "./authorization";

const SessionContext = createContext(null);
const obsolete = () => new DOMException("A sessão mudou.", "AbortError");

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const active = useRef(null);
  const generation = useRef(0);
  const loginController = useRef(null);

  const logout = useCallback((reason = "") => {
    generation.current += 1;
    active.current = null;
    loginController.current?.abort();
    loginController.current = null;
    setSession(null);
    setPending(false);
    setMessage(reason);
  }, []);

  useEffect(() => () => {
    generation.current += 1;
    active.current = null;
    loginController.current?.abort();
  }, []);

  const login = useCallback(async (username, password) => {
    const attempt = ++generation.current;
    active.current = null;
    setSession(null);
    setMessage("");
    setPending(true);
    loginController.current?.abort();
    const controller = new AbortController();
    loginController.current = controller;
    try {
      const authorization = basicAuthorization(username, password);
      // The server has HTTP Basic, not a token/session creation endpoint.
      // Verify against a protected read before exposing playlist actions.
      const response = await fetch(apiUrl("/lists"), {
        headers: { Authorization: authorization, Accept: "application/json" },
        credentials: "omit",
        redirect: "error",
        signal: controller.signal,
      });
      if (attempt !== generation.current) return false;
      if (response.status === 401) throw new Error("Usuário ou senha inválidos.");
      if (response.status === 403) throw new Error("Este usuário não tem permissão para acessar playlists.");
      if (!response.ok) throw new Error("A API não conseguiu validar o acesso. Tente novamente.");
      const data = await response.json();
      if (attempt !== generation.current) return false;
      if (!Array.isArray(data)) throw new Error("A API retornou um formato inesperado.");
      const next = { authorization, username: username.trim(), version: attempt };
      active.current = next;
      setSession(next);
      return true;
    } catch (error) {
      if (attempt === generation.current) {
        setMessage(error.name === "TypeError"
          ? "Não foi possível acessar a API. Verifique a configuração e tente novamente."
          : error.message);
      }
      return false;
    } finally {
      if (attempt === generation.current) {
        setPending(false);
        loginController.current = null;
      }
    }
  }, []);

  const isCurrent = useCallback(() => Boolean(session && active.current === session), [session]);
  const getAuthorization = useCallback(() => {
    if (!session || active.current !== session) throw obsolete();
    return session.authorization;
  }, [session]);

  const request = useCallback(async (path, options = {}) => {
    const authorization = requireAuthorization(getAuthorization);
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: { ...options.headers, Authorization: authorization, Accept: "application/json" },
      credentials: "omit",
      redirect: "error",
    });
    if (!isCurrent()) throw obsolete();
    if (response.status === 401) {
      logout("Sua sessão não é mais válida. Entre novamente.");
      throw obsolete();
    }
    return response;
  }, [getAuthorization, isCurrent, logout]);

  return (
    <SessionContext.Provider value={{
      authenticated: Boolean(session), username: session?.username,
      sessionVersion: session?.version ?? 0, pending, message,
      login, logout, getAuthorization, isCurrent, request,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("SessionProvider ausente na montagem.");
  return session;
}
