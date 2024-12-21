import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Playlists from './pages/Playlists';

function AppRoutes() {
  return (
    <div className="app-content"> 
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='*' element={<NotFound />} />
          <Route path='playlists' element={<Playlists/>}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default AppRoutes;
