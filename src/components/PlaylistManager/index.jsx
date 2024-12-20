import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    styled,
} from '@mui/material';
import './PlaylistManager.css';
import OndasDeSom from '../WaveMenu';

const CustomCard = styled(Card)(({ theme }) => ({
    maxWidth: 400,
    margin: 'auto',
    textAlign: 'center',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.background.paper,
}));

const WaveMenu = styled('ul')(() => ({
    border: '4px solid #545FE5',
    borderRadius: 50,
    width: 200,
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: '20px auto 0',
    listStyle: 'none',
}));

const PlaylistManager = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                bgcolor: 'background.default',
            }}
        >
            <CustomCard>
                <CardHeader
                    title="Subscribe"
                    titleTypographyProps={{
                        variant: 'h5',
                        fontWeight: 'bold',
                    }}
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Get fresh web design resources delivered straight to your inbox
                        every week.
                    </Typography>
                    <Box
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mb: 2
                        }}
                    >
                        <TextField
                            label="Your Email"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            Sign up
                        </Button>
                    </Box>
                    <div style={{ marginLeft: 80 }}>
                        <OndasDeSom />
                    </div>
                </CardContent>
            </CustomCard>
        </Box>
    );
};

export default PlaylistManager;
