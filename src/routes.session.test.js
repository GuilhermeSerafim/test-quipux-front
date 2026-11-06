import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@emotion/react";
import theme from "./styles/GlobalStyles";
import App from "./routes";

let host, root, originalFetch;
const response = (data = [], status = 200) => ({
  ok: status >= 200 && status < 300, status, json: async () => data,
});
const playlist = (nome) => ({ id: nome, nome, descricao: "Synthetic", musicas: [] });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const button = (text) => [...host.querySelectorAll("button,a")].find(el => el.textContent === text);
async function click(text) {
  const element = button(text);
  expect(element).toBeDefined();
  await act(async () => element.click());
}
async function fill(name, value) {
  const element = host.querySelector('input[name="' + name + '"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function login(username = "synthetic") {
  await fill("username", username);
  await fill("password", "synthetic-only");
  await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
}
beforeEach(async () => {
  originalFetch = global.fetch;
  global.fetch = jest.fn(async () => response());
  host = document.createElement("div"); document.body.appendChild(host);
  root = createRoot(host);
  window.history.replaceState({}, "", "/");
  await act(async () => root.render(<React.StrictMode><ThemeProvider theme={theme}><App /></ThemeProvider></React.StrictMode>));
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove();
  global.fetch = originalFetch; jest.restoreAllMocks();
});

test("mounted application gates actions and does not make unauthenticated requests", () => {
  expect(host.querySelector('input[name="username"]')).not.toBeNull();
  expect(host.querySelector('input[name="password"]')).not.toBeNull();
  expect(host.textContent).not.toContain("Enviar Playlist");
  expect(global.fetch).not.toHaveBeenCalled();
});
test("login verifies Basic at API, logout clears view and never persists credentials", async () => {
  const storage = jest.spyOn(Storage.prototype, "setItem");
  await login();
  expect(host.textContent).toContain("Conectado como synthetic");
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toMatch(/^Basic /);
  expect(options.credentials).toBe("omit");
  await click("Sair / trocar conta");
  expect(host.textContent).not.toContain("Enviar Playlist");
  expect(host.querySelector('input[name="password"]').value).toBe("");
  expect(storage).not.toHaveBeenCalled();
});
test("invalid login is retryable and cancelling a pending login rejects late success", async () => {
  global.fetch.mockResolvedValue(response([], 401));
  await login();
  expect(host.textContent).toContain("Usuário ou senha inválidos");
  const pending = deferred(); global.fetch.mockReturnValue(pending.promise);
  await login();
  await click("Cancelar");
  await act(async () => pending.resolve(response()));
  expect(host.textContent).not.toContain("Enviar Playlist");
  global.fetch.mockResolvedValue(response());
  await login("replacement");
  expect(host.textContent).toContain("Conectado como replacement");
});
test("retry loads and filters data; delete failure preserves the list", async () => {
  await login();
  global.fetch.mockResolvedValue(response([], 503));
  await click("Ver playlists");
  expect(host.textContent).toContain("Erro ao carregar");
  global.fetch.mockResolvedValue(response([playlist("Jazz"), playlist("Rock")]));
  await click("Tentar novamente");
  expect(host.textContent).toContain("Jazz");
  const search = host.querySelector('input[aria-label="search"]');
  expect(search).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(search, "jAzZ");
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(host.textContent).toContain("Jazz");
  expect(host.textContent).not.toContain("Rock");
  global.fetch.mockResolvedValue(response([], 403));
  await act(async () => host.querySelector('button[aria-label="Excluir playlist Jazz"]').click());
  expect(host.textContent).toContain("Erro ao deletar");
  expect(host.textContent).toContain("Jazz");
  expect(host.textContent).toContain("Conectado como synthetic");
});
test("late GET JSON cannot populate the next session", async () => {
  await login();
  const pending = deferred();
  global.fetch.mockResolvedValue({ ...response(), json: () => pending.promise });
  await click("Ver playlists");
  await click("Sair / trocar conta");
  global.fetch.mockResolvedValue(response([playlist("Current")]));
  await login("replacement");
  expect(host.textContent).toContain("Current");
  await act(async () => pending.resolve([playlist("Stale")]));
  expect(host.textContent).not.toContain("Stale");
  expect(host.textContent).toContain("Current");
});
test.each([204, 401, 500])("late DELETE status %s cannot remove data or expire next session", async status => {
  await login();
  global.fetch.mockResolvedValue(response([playlist("Shared")]));
  await click("Ver playlists");
  const pending = deferred(); global.fetch.mockReturnValue(pending.promise);
  await act(async () => host.querySelector('button[aria-label="Excluir playlist Shared"]').click());
  await click("Sair / trocar conta");
  global.fetch.mockResolvedValue(response([playlist("Shared")]));
  await login("replacement");
  await act(async () => pending.resolve(response([], status)));
  expect(host.textContent).toContain("Conectado como replacement");
  expect(host.textContent).toContain("Shared");
  expect(host.textContent).not.toContain("Erro ao deletar");
});
test("current-session 401 returns to login with expiration notice", async () => {
  await login();
  global.fetch.mockResolvedValue(response([], 401));
  await click("Ver playlists");
  expect(host.textContent).toContain("Sua sessão não é mais válida");
  expect(host.querySelector('input[name="password"]')).not.toBeNull();
  expect(host.textContent).not.toContain("Conectado como");
});

test.each([201, 401])("late POST status %s cannot reset or expire next session", async status => {
  await login();
  const inputs = [...host.querySelectorAll("input")];
  const values = ["Synthetic playlist", "Description", "Song", "Artist", "Album", "2026", "Jazz"];
  for (let index = 0; index < inputs.length; index++) {
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(inputs[index], values[index]);
      inputs[index].dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  await click("Adicionar Música");
  const pending = deferred(); global.fetch.mockReturnValue(pending.promise);
  await act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  expect(host.textContent).toContain("Enviando...");
  await click("Sair / trocar conta");
  global.fetch.mockResolvedValue(response());
  await login("replacement");
  await act(async () => pending.resolve(response([], status)));
  expect(host.textContent).toContain("Conectado como replacement");
  expect(host.textContent).not.toContain("Playlist adicionada com sucesso");
  expect(host.textContent).not.toContain("Enviando...");
});
