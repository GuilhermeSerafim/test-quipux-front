import React, { useState } from "react";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useSession } from "./SessionProvider";

export default function Login() {
  const { login, logout, pending, message } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const suppliedPassword = password;
    setPassword("");
    void login(username, suppliedPassword);
  };
  return (
    <Card sx={{ maxWidth: 420, m: "24px auto" }}>
      <CardContent>
        <Typography variant="h5" component="h2">Entrar no Quipux</Typography>
        <Typography sx={{ my: 2 }}>Use uma conta autorizada na API. O acesso fica apenas nesta aba e termina ao recarregar ou sair.</Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
          <TextField name="username" label="Usuário" autoComplete="username" required
            value={username} onChange={(event) => setUsername(event.target.value)} disabled={pending} />
          <TextField name="password" label="Senha" type="password" autoComplete="current-password" required
            value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} />
          {message && <Typography role="alert" color="error">{message}</Typography>}
          <Button type="submit" variant="contained" disabled={pending}>{pending ? "Validando acesso..." : "Entrar"}</Button>
          {pending && <Button type="button" onClick={() => logout()}>Cancelar</Button>}
        </Box>
      </CardContent>
    </Card>
  );
}
