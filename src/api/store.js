import { configureStore } from '@reduxjs/toolkit';
import playlistsReducer, { fetchPlaylists } from './reducers/playlistReducer.js';

export const store = configureStore({
    reducer: {
        playlists: playlistsReducer,
    },
});

