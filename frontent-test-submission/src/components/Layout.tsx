import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link as LinkIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // Don't show navigation on redirect pages (shortcode routes)
  const isRedirectPage = location.pathname !== '/' && location.pathname !== '/stats';

  if (isRedirectPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={2}>
        <Container maxWidth="lg">
          <Toolbar>
            <LinkIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                variant={location.pathname === '/' ? 'outlined' : 'text'}
                startIcon={<LinkIcon />}
              >
                Create
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/stats"
                variant={location.pathname === '/stats' ? 'outlined' : 'text'}
                startIcon={<AnalyticsIcon />}
              >
                Statistics
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <main>
        {children}
      </main>
    </Box>
  );
};

export default Layout;