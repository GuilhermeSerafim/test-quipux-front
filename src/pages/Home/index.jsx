import { useEffect, useRef, useState } from "react";
import { useSession } from "../../auth/SessionProvider";
import {  Button, Card, CardContent, CardHeader, FormControl, TextField, Typography } from "@mui/material";

export default function Home() {
    const { request, isCurrent: sessionIsCurrent } = useSession();
    const generation = useRef(0);
    const controllerRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => () => {
        generation.current += 1;
        controllerRef.current?.abort();
    }, []);
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

        const operation = ++generation.current;
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        const isCurrent = () => operation === generation.current && sessionIsCurrent();
        setSubmitting(true);
        try {
            const response = await request("/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            if (!isCurrent()) return;
            if (!response.ok) throw new Error(response.status === 403
                ? "Sem permissão para adicionar playlists."
                : "Não foi possível adicionar a playlist. Tente novamente.");
            setMessage("Playlist adicionada com sucesso!");
            setPlaylistName("");
            setDescription("");
            setSongs([]);
        } catch (error) {
            if (isCurrent()) setError(error.name === "TypeError"
                ? "Não foi possível acessar a API. Tente novamente."
                : error.message);
        } finally {
            if (isCurrent()) setSubmitting(false);
        }
    };

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
                    {songs.length > 0 ?
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
                        disabled={submitting}
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
                        {submitting ? "Enviando..." : "Enviar Playlist"}
                    </Button>
                </FormControl>
                {error && <Typography role="alert" color="error">{error}</Typography>}
                {message && (
                    <Typography role="status" variant="body2" color={message.includes("sucesso") ? "success.main" : "error"} sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
