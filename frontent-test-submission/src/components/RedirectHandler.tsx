import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Link as LinkIcon, Error as ErrorIcon } from '@mui/icons-material';
import { LocalStorageService, type ClickRecord } from '../services/localStorageService';
import { Log } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const storageService = LocalStorageService.getInstance();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortcode) {
        setStatus('error');
        setErrorMessage('No shortcode provided');
        Log('client', 'error', 'RedirectHandler', 'No shortcode provided in URL');
        return;
      }

      Log('client', 'info', 'RedirectHandler', `Processing redirect for shortcode: ${shortcode}`);

      try {
        const shortUrl = storageService.getShortURLByCode(shortcode);

        if (!shortUrl) {
          setStatus('error');
          setErrorMessage('Short URL not found. It may have been deleted or never existed.');
          Log('client', 'warn', 'RedirectHandler', `Short URL not found: ${shortcode}`);
          return;
        }

        // Check if URL is expired
        if (storageService.isURLExpired(shortUrl)) {
          setStatus('expired');
          setErrorMessage('This short URL has expired.');
          Log('client', 'warn', 'RedirectHandler', `Short URL expired: ${shortcode}`);
          return;
        }

        // Check if URL is active
        if (!shortUrl.isActive) {
          setStatus('error');
          setErrorMessage('This short URL has been deactivated.');
          Log('client', 'warn', 'RedirectHandler', `Short URL deactivated: ${shortcode}`);
          return;
        }

        // Record the click
        const clickRecord: ClickRecord = {
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'Direct'
        };

        storageService.recordClick(shortcode, clickRecord);
        Log('client', 'info', 'RedirectHandler', `Click recorded for: ${shortcode}`);

        setStatus('redirecting');

        // Add a small delay for better UX, then redirect
        setTimeout(() => {
          Log('client', 'info', 'RedirectHandler', `Redirecting to: ${shortUrl.originalUrl}`);
          window.location.href = shortUrl.originalUrl;
        }, 1500);

      } catch (error) {
        setStatus('error');
        setErrorMessage('An error occurred while processing the redirect.');
        Log('client', 'error', 'RedirectHandler', `Error processing redirect: ${error}`);
      }
    };

    handleRedirect();
  }, [shortcode, storageService]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box textAlign="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              Looking up short URL...
            </Typography>
          </Box>
        );

      case 'redirecting':
        return (
          <Box textAlign="center">
            <LinkIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main" mb={2}>
              Redirecting you now...
            </Typography>
            <CircularProgress size={24} />
          </Box>
        );

      case 'expired':
        return (
          <Box textAlign="center">
            <ErrorIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" color="warning.main" mb={2}>
              Link Expired
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
            <Typography variant="body1">
              This short URL has reached its expiration time and is no longer valid.
            </Typography>
          </Box>
        );

      case 'error':
      default:
        return (
          <Box textAlign="center">
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error.main" mb={2}>
              URL Not Found
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
            <Typography variant="body1">
              The short URL "/{shortcode}" could not be found or is no longer available.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6 }}>
        {renderContent()}
        
        {(status === 'error' || status === 'expired') && (
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                ← Create a new short URL
              </a>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RedirectHandler;