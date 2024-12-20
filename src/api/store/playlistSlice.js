import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Função para buscar playlists
export const fetchPlaylists = createAsyncThunk("playlists/fetchPlaylists", async () => {
  const response = await fetch("http://localhost:8080/lists");
  return await response.json();
});

// Função para adicionar uma playlist
export const addPlaylist = createAsyncThunk("playlists/addPlaylist", async (playlist) => {
  const response = await fetch("http://localhost:8080/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playlist),
  });
  return await response.json();
});

// Função para deletar uma playlist
export const deletePlaylist = createAsyncThunk("playlists/deletePlaylist", async (id) => {
  await fetch(`http://localhost:8080/lists/${id}`, { method: "DELETE" });
  return id;
});

const playlistSlice = createSlice({
  name: "playlists",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addPlaylist.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.data = state.data.filter((playlist) => playlist.id !== action.payload);
      });
  },
});

export default playlistSlice.reducer;
