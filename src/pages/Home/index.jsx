import { useState } from "react";
import { Box, Button, Card, CardContent, CardHeader, FormControl, styled, TextField, Typography } from "@mui/material";

export default function Home() {
    const [playlistName, setPlaylistName] = useState("");
    const [description, setDescription] = useState("");
    const [musicTitle, setMusicTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [album, setAlbum] = useState("");
    const [year, setYear] = useState("");
    const [genre, setGenre] = useState("");
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Adicionar música à lista de músicas
    const handleAddSong = () => {
        if (!musicTitle || !artist || !album || !year || !genre) {
            setError("Preencha todos os campos de música antes de adicioná-la.");
            return;
        }

        setSongs([
            ...songs,
            {
                titulo: musicTitle,
                artista: artist,
                album: album,
                ano: year,
                genero: genre,
            },
        ]);
        // Limpar os campos após adicionar
        setMusicTitle("");
        setArtist("");
        setAlbum("");
        setYear("");
        setGenre("");
        setError(""); // Limpar erros
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Reset message
        setError(""); // Reset error

        if (!playlistName || !description || songs.length === 0) {
            setError("Todos os campos da playlist e ao menos uma música são obrigatórios.");
            return;
        }

        const payload = {
            nome: playlistName,
            descricao: description,
            musicas: songs,
        };

        try {
            const response = await fetch(`http://localhost:8080/lists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic " + btoa("user:27445dd9-616f-457e-8a0c-05725d8ae4f8"),
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage("Playlist adicionada com sucesso!");
                // Resetar campos
                setPlaylistName("");
                setDescription("");
                setSongs([]);
            } else {
                const errorData = await response.json();
                setMessage(`Erro: ${errorData.message || "Não foi possível adicionar a playlist."}`);
            }
        } catch (error) {
            console.error("Erro ao enviar dados:", error);
            setMessage("Erro ao adicionar playlist. Tente novamente.");
        }
    };

    const CustomCard = styled(Card)(({ theme }) => ({
        maxWidth: 400,
        margin: "auto",
        textAlign: "center",
        padding: theme.spacing(3),
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.background.paper,
    }));

    return (
        <Card
            sx={(theme) => ({
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                maxWidth: 400,
                margin: "20px auto",
                textAlign: "center",
                padding: theme.spacing(3),
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[4],
                backgroundColor: theme.palette.background.paper,
            })}
        >
            <CardHeader
                title="Adicionar Playlist"
                titleTypographyProps={{
                    variant: "h5",
                    fontWeight: "bold",
                }}
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Personalize sua experiência!
                    Cada playlist pode conter apenas uma seção de músicas.*
                </Typography>
                <FormControl
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <TextField
                        label="Nome da Playlist"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                    <TextField
                        label="Descrição"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Adicionar Música:
                    </Typography>
                    <TextField
                        label="Título da Música"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={musicTitle}
                        onChange={(e) => setMusicTitle(e.target.value)}
                    />
                    <TextField
                        label="Artista"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                    />
                    <TextField
                        label="Álbum"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={album}
                        onChange={(e) => setAlbum(e.target.value)}
                    />
                    <TextField
                        label="Ano"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                    <TextField
                        label="Gênero"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="contained"
                        onClick={handleAddSong}
                        sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            backgroundColor: "#545FE5",
                            "&:hover": {
                                backgroundColor: "#3f46b5",
                            },
                        }}
                    >
                        Adicionar Música
                    </Button>
                    {songs > 0 ?
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            Músicas adicionadas:
                        </Typography> : ""
                    }
                    {songs.map((song, index) => (
                        <Typography key={index} variant="body2">
                            {song.titulo} - {song.artista}
                        </Typography>
                    ))}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            backgroundColor: "#545FE5",
                            "&:hover": {
                                backgroundColor: "#3f46b5",
                            },
                        }}
                    >
                        Enviar Playlist
                    </Button>
                </FormControl>
                {message && (
                    <Typography variant="body2" color={message.includes("sucesso") ? "success.main" : "error"} sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
