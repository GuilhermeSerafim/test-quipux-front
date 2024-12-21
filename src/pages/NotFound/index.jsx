import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import img from "./notfound.jpg";

export default function NotFound() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                bgcolor: '#fff',
                textAlign: 'center',
                padding: 4,
            }}
        >
            <img
                src={img} // Substitua pelo caminho correto da imagem
                alt="404 Not Found"
                style={{
                    maxWidth: '600px', // Ajuste o tamanho desejado
                    height: 'auto', // Mantém a proporção da imagem
                    marginBottom: '20px',            
                }}
            />
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                Oops! Página não encontrada
            </Typography>
            <Button
                variant="contained"
                color="primary"
                href="/"
                sx={{
                    textTransform: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    bgcolor: '#545FE5',
                    '&:hover': {
                        bgcolor: '#3f46b5',
                    },
                }}
            >
                Voltar para a Página Inicial
            </Button>
        </Box>
    );
}
