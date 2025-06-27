import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Button
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LocalStorageService, type ShortURL, type ClickRecord } from '../services/localStorageService';
import { Log } from '../utils/logger';

const StatsPage: React.FC = () => {
  const [shortUrls, setShortUrls] = useState<ShortURL[]>([]);
  const [loading, setLoading] = useState(true);

  const storageService = LocalStorageService.getInstance();

  const loadData = () => {
    Log('client', 'info', 'StatsPage', 'Loading statistics data');
    setLoading(true);
    try {
      const urls = storageService.getAllShortURLs();
      setShortUrls(urls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      Log('client', 'info', 'StatsPage', `Loaded ${urls.length} URLs for statistics`);
    } catch (error) {
      Log('client', 'error', 'StatsPage', `Error loading data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clearAllData();
      setShortUrls([]);
      Log('client', 'info', 'StatsPage', 'All data cleared by user');
    }
  };

  const getTotalClicks = () => {
    return shortUrls.reduce((total, url) => total + url.clicks.length, 0);
  };

  const getActiveUrls = () => {
    return shortUrls.filter(url => url.isActive && !storageService.isURLExpired(url)).length;
  };

  const getExpiredUrls = () => {
    return shortUrls.filter(url => storageService.isURLExpired(url)).length;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusChip = (url: ShortURL) => {
    if (!url.isActive) {
      return <Chip label="Inactive" color="default" size="small" />;
    }
    if (storageService.isURLExpired(url)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const getClicksInLast24Hours = (url: ShortURL) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return url.clicks.filter(click => click.timestamp > oneDayAgo).length;
  };

  const getMostRecentClick = (url: ShortURL) => {
    if (url.clicks.length === 0) return null;
    return url.clicks.reduce((latest, click) => 
      click.timestamp > latest.timestamp ? click : latest
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AnalyticsIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" component="h1" color="primary">
              URL Statistics
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearAllData}
            >
              Clear All Data
            </Button>
          </Box>
        </Box>

        {shortUrls.length === 0 ? (
          <Alert severity="info">
            No short URLs created yet. <a href="/">Create your first short URL</a> to see statistics here.
          </Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <CardContent>
                    <LinkIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{shortUrls.length}</Typography>
                    <Typography variant="body2">Total URLs</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'success.contrastText' }}>
                  <CardContent>
                    <VisibilityIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{getTotalClicks()}</Typography>
                    <Typography variant="body2">Total Clicks</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'info.contrastText' }}>
                  <CardContent>
                    <EventIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{getActiveUrls()}</Typography>
                    <Typography variant="body2">Active URLs</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                  <CardContent>
                    <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{getExpiredUrls()}</Typography>
                    <Typography variant="body2">Expired URLs</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Short URL</strong></TableCell>
                    <TableCell><strong>Original URL</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Total Clicks</strong></TableCell>
                    <TableCell><strong>Clicks (24h)</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Expires</strong></TableCell>
                    <TableCell><strong>Last Click</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortUrls.map((url) => {
                    const recentClick = getMostRecentClick(url);
                    return (
                      <TableRow key={url.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2" color="primary">
                              /{url.shortcode}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title={url.originalUrl}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {url.originalUrl}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell>{getStatusChip(url)}</TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <VisibilityIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{url.clicks.length}</Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="primary">
                            {getClicksInLast24Hours(url)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(url.createdAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={storageService.isURLExpired(url) ? 'error' : 'text.secondary'}
                          >
                            {formatDate(url.expiresAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          {recentClick ? (
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(recentClick.timestamp)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              Never
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Click Details for URLs with clicks */}
            {shortUrls.some(url => url.clicks.length > 0) && (
              <Box mt={4}>
                <Typography variant="h5" mb={3} color="primary">
                  Detailed Click Analytics
                </Typography>
                
                {shortUrls
                  .filter(url => url.clicks.length > 0)
                  .map((url) => (
                    <Card key={url.id} sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" mb={2}>
                          /{url.shortcode} - {url.clicks.length} clicks
                        </Typography>
                        
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>User Agent</TableCell>
                                <TableCell>Referrer</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {url.clicks
                                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                                .slice(0, 10) // Show last 10 clicks
                                .map((click, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {formatDate(click.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          maxWidth: 200, 
                                          overflow: 'hidden', 
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {click.userAgent || 'Unknown'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {click.referrer || 'Direct'}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        {url.clicks.length > 10 && (
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Showing last 10 of {url.clicks.length} clicks
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default StatsPage;