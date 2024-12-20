import React from 'react';
import { Box, Typography, Link, styled } from '@mui/material';

const FooterContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    bottom: 0,
    textAlign: 'center',
    marginTop: 70
}));

const FooterLinks = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

const Footer = () => {
    return (
        <FooterContainer>
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} QuipuxTeste. Todos os direitos reservados.
            </Typography>
            <FooterLinks>
                <Link href="#" underline="hover" color="primary">
                    Sobre
                </Link>
                <Link href="#" underline="hover" color="primary">
                    Termos de Uso
                </Link>
                <Link href="#" underline="hover" color="primary">
                    Política de Privacidade
                </Link>
            </FooterLinks>
        </FooterContainer>
    );
};

export default Footer;
