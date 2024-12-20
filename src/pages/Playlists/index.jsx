import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import backgroundImage from './iaColorMusic.avif'; // Substitua pelo caminho correto da imagem

export default function Playlists() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/lists', {
          headers: {
            Authorization: 'Basic ' + btoa('user:27445dd9-616f-457e-8a0c-05725d8ae4f8'),
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar os dados da API.');
        }

        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Typography variant="h6" sx={{ textAlign: 'center' }}>Carregando playlists...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>{error}</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Typography variant="h4" sx={{ textAlign: 'center', color: 'white', mb: 4 }}>
        Minhas Playlists
      </Typography>
      <Grid2 container sx={{display: "flex", justifyContent:"center"}} spacing={2}>
        {items.map((playlist) => (
          <Grid2 item xs={12} sm={6} md={4} key={playlist.id} >
            <Card sx={{ maxWidth: 345 }}>
              <CardMedia
                sx={{ height: 140, width: 300 }}
                image={backgroundImage} // Coloque uma imagem padrão ou específica
                title={playlist.nome}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {playlist.nome}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {playlist.descricao}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Músicas:
                </Typography>
                {playlist.musicas.map((musica) => (
                  <Typography variant="body2" key={musica.id}>
                    {musica.titulo} - {musica.artista}
                  </Typography>
                ))}
              </CardContent>
              <CardActions>
                <Button sx={(theme)=> ({width: "100%"})} color='error' size="large" onClick={()=> console.log("Teste")}>Excluir</Button>
              </CardActions>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
