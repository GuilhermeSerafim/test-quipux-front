import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import backgroundImage from "./iaColorMusic.avif";
import { MusicOff } from "@mui/icons-material";
import SearchAppBar from "../../components/SearchAppBar";

export default function Playlists() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/lists", {
          headers: {
            Authorization:
              "Basic " + btoa("user:27445dd9-616f-457e-8a0c-05725d8ae4f8"),
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados da API.");
        }

        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    try {
      const response = await fetch(`http://localhost:8080/lists/${listName}`, {
        method: "DELETE",
        headers: {
          Authorization:
            "Basic " + btoa("user:27445dd9-616f-457e-8a0c-05725d8ae4f8"),
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar a lista de reprodução.");
      }

      setItems((prevItems) =>
        prevItems.filter((playlist) => playlist.nome !== listName)
      );
    } catch (error) {
      console.error("Erro ao deletar lista:", error);
      setError("Erro ao deletar a lista.");
    }
  };

  if (loading) {
    return (
      <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
        Carregando playlists...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: "center" }}>
        {error}
      </Typography>
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
        <Grid2
          container
          sx={{ display: "flex", justifyContent: "center" }}
          spacing={8}
        >
          {filteredItems.map((playlist) => (
            <Grid2 xs={12} sm={6} md={4} key={playlist.id}>
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
