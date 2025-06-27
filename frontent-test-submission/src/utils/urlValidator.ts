import { Log } from './logger';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateURL(url: string): ValidationResult {
  Log('client', 'info', 'urlValidator', `Validating URL: ${url}`);
  
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Add protocol if missing
  let urlToValidate = url.trim();
  if (!urlToValidate.match(/^https?:\/\//)) {
    urlToValidate = 'https://' + urlToValidate;
  }

  try {
    const urlObj = new URL(urlToValidate);
    
    // Basic validation checks
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid hostname' };
    }

    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return { isValid: false, error: 'Localhost URLs are not allowed' };
    }

    // Check for valid TLD (basic check)
    if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
      return { isValid: false, error: 'Invalid domain format' };
    }

    Log('client', 'info', 'urlValidator', `URL validated successfully: ${urlToValidate}`);
    return { isValid: true };
  } catch (error) {
    Log('client', 'error', 'urlValidator', `URL validation failed: ${error}`);
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export function validateURLs(urls: string[]): ValidationResult[] {
  Log('client', 'info', 'urlValidator', `Validating ${urls.length} URLs`);
  return urls.map(url => validateURL(url));
}