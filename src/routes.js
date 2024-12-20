import React from 'react';
import PlaylistManager from './components/PlaylistManager';
import { BrowserRouter, Route, Routes } from 'react-router';
import NotFound from './pages/NotFound';
import Home from './pages/Home';

function AppRoutes() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='*' element={<NotFound/>}/>
        <Route path='playlists'/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default AppRoutes;
