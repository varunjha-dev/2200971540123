import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  Timer as TimerIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { validateURLs } from '../utils/urlValidator';
import { generateShortcode, validateShortcode, isShortcodeUnique } from '../utils/shortcode';
import { LocalStorageService, type ShortURL } from '../services/localStorageService';
import { Log } from '../utils/logger';

interface URLInput {
  url: string;
  customShortcode: string;
  validityMinutes: number;
  error?: string;
}

const URLShortenerPage: React.FC = () => {
  const [urlInputs, setUrlInputs] = useState<URLInput[]>([
    { url: '', customShortcode: '', validityMinutes: 30 }
  ]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdUrls, setCreatedUrls] = useState<ShortURL[]>([]);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const storageService = LocalStorageService.getInstance();

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { url: '', customShortcode: '', validityMinutes: 30 }]);
      Log('client', 'info', 'URLShortener', `Added URL input field. Total: ${urlInputs.length + 1}`);
    }
  };

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      const newInputs = urlInputs.filter((_, i) => i !== index);
      setUrlInputs(newInputs);
      Log('client', 'info', 'URLShortener', `Removed URL input field. Total: ${newInputs.length}`);
    }
  };

  const updateUrlInput = (index: number, field: keyof URLInput, value: string | number) => {
    const newInputs = [...urlInputs];
    newInputs[index] = { ...newInputs[index], [field]: value, error: undefined };
    setUrlInputs(newInputs);
  };

  const copyToClipboard = async (text: string, shortcode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [shortcode]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [shortcode]: false });
      }, 2000);
      Log('client', 'info', 'URLShortener', `Copied to clipboard: ${shortcode}`);
    } catch (error) {
      Log('client', 'error', 'URLShortener', `Failed to copy: ${error}`);
    }
  };

  const validateInputs = (): boolean => {
    const existingShortcodes = storageService.getExistingShortcodes();
    let hasErrors = false;
    
    const newInputs = urlInputs.map((input, index) => {
      const updatedInput = { ...input, error: undefined };
      
      // Validate URL
      const urlValidation = validateURLs([input.url])[0];
      if (!urlValidation.isValid) {
        updatedInput.error = urlValidation.error;
        hasErrors = true;
        return updatedInput;
      }

      // Validate custom shortcode if provided
      if (input.customShortcode.trim()) {
        const shortcodeValidation = validateShortcode(input.customShortcode);
        if (!shortcodeValidation.isValid) {
          updatedInput.error = shortcodeValidation.error;
          hasErrors = true;
          return updatedInput;
        }

        // Check uniqueness against existing shortcodes
        const allCustomShortcodes = urlInputs
          .map(inp => inp.customShortcode.trim())
          .filter(code => code !== '');
        
        const duplicateIndex = allCustomShortcodes.indexOf(input.customShortcode.trim());
        const isDuplicateInForm = duplicateIndex !== -1 && duplicateIndex !== index;
        
        if (!isShortcodeUnique(input.customShortcode.trim(), existingShortcodes) || isDuplicateInForm) {
          updatedInput.error = 'This shortcode is already in use';
          hasErrors = true;
          return updatedInput;
        }
      }

      // Validate validity period
      if (input.validityMinutes < 1 || input.validityMinutes > 43200) { // Max 30 days
        updatedInput.error = 'Validity must be between 1 minute and 30 days (43200 minutes)';
        hasErrors = true;
        return updatedInput;
      }

      return updatedInput;
    });

    setUrlInputs(newInputs);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    Log('client', 'info', 'URLShortener', 'Starting URL shortening process');
    setLoading(true);
    setSuccessMessage('');
    setCreatedUrls([]);

    try {
      if (!validateInputs()) {
        setLoading(false);
        return;
      }

      const existingShortcodes = storageService.getExistingShortcodes();
      const newShortUrls: ShortURL[] = [];

      for (const input of urlInputs) {
        let shortcode = input.customShortcode.trim();
        
        // Generate shortcode if not provided
        if (!shortcode) {
          do {
            shortcode = generateShortcode();
          } while (!isShortcodeUnique(shortcode, [...existingShortcodes, ...newShortUrls.map(u => u.shortcode)]));
        }

        // Normalize URL
        let normalizedUrl = input.url.trim();
        if (!normalizedUrl.match(/^https?:\/\//)) {
          normalizedUrl = 'https://' + normalizedUrl;
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + input.validityMinutes * 60000);

        const shortUrl: ShortURL = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          originalUrl: normalizedUrl,
          shortcode,
          createdAt: now,
          expiresAt,
          validityMinutes: input.validityMinutes,
          clicks: [],
          isActive: true
        };

        newShortUrls.push(shortUrl);
      }

      storageService.saveMultipleShortURLs(newShortUrls);
      setCreatedUrls(newShortUrls);
      setSuccessMessage(`Successfully created ${newShortUrls.length} short URL${newShortUrls.length > 1 ? 's' : ''}!`);
      
      // Reset form
      setUrlInputs([{ url: '', customShortcode: '', validityMinutes: 30 }]);
      
      Log('client', 'info', 'URLShortener', `Successfully created ${newShortUrls.length} short URLs`);
    } catch (error) {
      Log('client', 'error', 'URLShortener', `Error creating short URLs: ${error}`);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LinkIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h1" color="primary">
            URL Shortener
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" mb={4}>
          Create up to 5 short URLs at once with custom shortcodes and validity periods.
        </Typography>

        <Grid container spacing={3}>
          {urlInputs.map((input, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    URL #{index + 1}
                  </Typography>
                  {urlInputs.length > 1 && (
                    <IconButton 
                      onClick={() => removeUrlInput(index)}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com"
                      value={input.url}
                      onChange={(e) => updateUrlInput(index, 'url', e.target.value)}
                      error={!!input.error && input.error.includes('URL')}
                      helperText={input.error && input.error.includes('URL') ? input.error : ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      placeholder="mycode123"
                      value={input.customShortcode}
                      onChange={(e) => updateUrlInput(index, 'customShortcode', e.target.value)}
                      error={!!input.error && input.error.includes('shortcode')}
                      helperText={input.error && input.error.includes('shortcode') ? input.error : 'Leave empty for auto-generation'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Validity (Minutes)"
                      value={input.validityMinutes}
                      onChange={(e) => updateUrlInput(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                      error={!!input.error && input.error.includes('Validity')}
                      helperText={input.error && input.error.includes('Validity') ? input.error : 'Default: 30 minutes'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TimerIcon color="action" />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1, max: 43200 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={3} display="flex" gap={2} flexWrap="wrap">
          {urlInputs.length < 5 && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrlInput}
            >
              Add Another URL
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            size="large"
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Creating...' : `Create Short URL${urlInputs.length > 1 ? 's' : ''}`}
          </Button>
        </Box>
      </Paper>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {createdUrls.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" mb={3} color="primary">
            Your Short URLs
          </Typography>
          
          <Grid container spacing={2}>
            {createdUrls.map((shortUrl) => (
              <Grid item xs={12} key={shortUrl.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" color="primary">
                        {window.location.origin}/{shortUrl.shortcode}
                      </Typography>
                      <Tooltip title={copiedStates[shortUrl.shortcode] ? 'Copied!' : 'Copy URL'}>
                        <IconButton
                          onClick={() => copyToClipboard(`${window.location.origin}/${shortUrl.shortcode}`, shortUrl.shortcode)}
                          color={copiedStates[shortUrl.shortcode] ? 'success' : 'primary'}
                        >
                          {copiedStates[shortUrl.shortcode] ? <CheckIcon /> : <CopyIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {shortUrl.originalUrl}
                    </Typography>
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        size="small" 
                        label={`Expires: ${shortUrl.expiresAt.toLocaleString()}`}
                        color="warning"
                      />
                      <Chip 
                        size="small" 
                        label={`Valid for: ${shortUrl.validityMinutes} minutes`}
                        color="info"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default URLShortenerPage;