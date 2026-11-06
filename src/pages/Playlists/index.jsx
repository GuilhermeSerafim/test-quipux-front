import { useSession } from "../../auth/SessionProvider";
import React, { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import backgroundImage from "./iaColorMusic.avif";
import MusicOff from "@mui/icons-material/MusicOff";
import SearchAppBar from "../../components/SearchAppBar";

export default function Playlists() {
  const { request, isCurrent: sessionIsCurrent, sessionVersion } = useSession();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const requestGeneration = useRef(0);

  useEffect(() => {
    const generation = ++requestGeneration.current;
    const controller = new AbortController();
    const isCurrent = () => generation === requestGeneration.current && sessionIsCurrent();
    setError(null);
    setDeleteError(null);
    setLoading(true);
    setItems([]);
    setFilteredItems([]);

    const fetchData = async () => {
      try {
        const response = await request("/lists", { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados da API.");
        }

        const data = await response.json();
        if (!isCurrent()) return;
        if (!Array.isArray(data)) throw new Error("Formato inesperado.");
        setItems(data);
      } catch (err) {
        if (isCurrent()) setError("Erro ao carregar os dados. Verifique a sessão e tente novamente.");
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };

    fetchData();
    return () => {
      // Invalidate both pending loads and deletes, even if a response ignores abort.
      requestGeneration.current += 1;
      controller.abort();
    };
  }, [request, sessionIsCurrent, sessionVersion, loadAttempt]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((playlist) =>
          playlist.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, items]);

  const handleDeletePlaylist = async (listName) => {
    const generation = requestGeneration.current;
    const isCurrent = () => generation === requestGeneration.current && sessionIsCurrent();
    setDeleteError(null);
    try {
      const response = await request("/lists/" + encodeURIComponent(listName), { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Erro ao deletar a lista de reprodução.");
      }

      if (!isCurrent()) return;
      setItems((prevItems) =>
        prevItems.filter((playlist) => playlist.nome !== listName)
      );
    } catch (error) {
      if (isCurrent()) setDeleteError("Erro ao deletar a lista. Tente novamente.");
    }
  };

  const handleRetry = () => setLoadAttempt((attempt) => attempt + 1);

  if (loading) {
    return (
      <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
        Carregando playlists...
      </Typography>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography role="alert" variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={handleRetry}>Tentar novamente</Button>
      </Box>
    );
  }

  return (
    <>
      <SearchAppBar setSearchTerm={setSearchTerm} />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{ textAlign: "center", color: "white", mb: 4 }}
        >
          Minhas Playlists
        </Typography>
        {deleteError && (
          <Typography role="alert" color="error" sx={{ textAlign: "center", mb: 2 }}>
            {deleteError}
          </Typography>
        )}
        <Grid2
          container
          sx={{ display: "flex", justifyContent: "center" }}
          spacing={8}
        >
          {filteredItems.map((playlist) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={playlist.id}>
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  sx={{ height: 140, width: 345 }}
                  image={backgroundImage}
                  title={playlist.nome}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {playlist.nome}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {playlist.descricao}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mt: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Músicas:
                  </Typography>
                  {playlist.musicas.map((musica) => (
                    <Typography
                      variant="body2"
                      key={musica.id}
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {musica.titulo} - {musica.artista}
                    </Typography>
                  ))}
                </CardContent>
                <CardActions>
                  <Button
                    color="error"
                    size="large"
                    aria-label={"Excluir playlist " + playlist.nome}
                    onClick={() => handleDeletePlaylist(playlist.nome)}
                  >
                    <MusicOff />
                  </Button>
                </CardActions>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </>
  );
}
