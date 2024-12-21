import { Box, Button, styled, Typography } from "@mui/material";
import laptopImg from "./laptop.jpg";
import Ondas from "../WaveMenu";
import { LibraryMusic } from "@mui/icons-material";
import { useNavigate } from "react-router";

export default function Header() {
    const navigate = useNavigate();
    // Estilos personalizados
    const StyledHeader = styled(Box)(({ theme }) => ({
        position: "relative",
        width: "100%",
        height: "200px",
        backgroundImage: `url(${laptopImg})`,
        backgroundSize: "",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center", 
        justifyContent: "center",
        padding: theme.spacing(3),
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
    }));

    const HeaderContent = styled(Box)(({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(2),
        textAlign: "center",
    }));

    const ExploreButton = styled(Button)(({ theme }) => ({
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(15),
        color: theme.palette.primary.contrastText,
        backgroundColor: "#545FE5",
        "&:hover": {
            backgroundColor: '#3f46b5',
        },
    }));

    return (
        <StyledHeader>
            <ExploreButton title="Procurar playlist" sx={{fontWeight: 500}} variant="contained" onClick={() => navigate("/playlists")}>
                <LibraryMusic/>
            </ExploreButton>
            <HeaderContent>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        color: "white",
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                >
                    Monte sua Playlist
                </Typography>
                <Ondas/>
            </HeaderContent>
        </StyledHeader>
    );
}
