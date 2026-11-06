import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Playlists from './pages/Playlists';
import { SessionProvider, useSession } from './auth/SessionProvider';
import Login from './auth/Login';
import { Box, Button, Typography } from '@mui/material';

function SessionRoutes() {
  const { authenticated, username, sessionVersion, logout } = useSession();
  if (!authenticated) return <Login />;
  return <>
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, p: 2 }}>
      <Typography>Conectado como {username}</Typography>
      <Button component={Link} to="/">Adicionar playlist</Button>
      <Button component={Link} to="/playlists">Ver playlists</Button>
      <Button onClick={() => logout()}>Sair / trocar conta</Button>
    </Box>
    <Routes key={sessionVersion}>
      <Route path='/' element={<Home />} />
      <Route path='*' element={<NotFound />} />
      <Route path='playlists' element={<Playlists />} />
    </Routes>
  </>;
}

function AppRoutes() {
  return (
    <div className="app-content"> 
      <BrowserRouter>
        <SessionProvider>
        <Header />
        <SessionRoutes />
        <Footer />
        </SessionProvider>
      </BrowserRouter>
    </div>
  );
}

export default AppRoutes;
