import { Log } from './logger';

export function generateShortcode(length: number = 6): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortcode = '';
  
  for (let i = 0; i < length; i++) {
    shortcode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  Log('client', 'info', 'shortcode', `Generated shortcode: ${shortcode}`);
  return shortcode;
}

export function validateShortcode(shortcode: string): { isValid: boolean; error?: string } {
  Log('client', 'info', 'shortcode', `Validating shortcode: ${shortcode}`);
  
  if (!shortcode || shortcode.trim() === '') {
    return { isValid: false, error: 'Shortcode cannot be empty' };
  }

  const trimmedShortcode = shortcode.trim();
  
  // Check length
  if (trimmedShortcode.length < 3 || trimmedShortcode.length > 20) {
    return { isValid: false, error: 'Shortcode must be between 3 and 20 characters' };
  }

  // Check if alphanumeric
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(trimmedShortcode)) {
    return { isValid: false, error: 'Shortcode must contain only letters and numbers' };
  }

  // Check for reserved words
  const reservedWords = ['api', 'www', 'admin', 'stats', 'app', 'create', 'delete', 'edit'];
  if (reservedWords.includes(trimmedShortcode.toLowerCase())) {
    return { isValid: false, error: 'This shortcode is reserved and cannot be used' };
  }

  Log('client', 'info', 'shortcode', `Shortcode validated successfully: ${trimmedShortcode}`);
  return { isValid: true };
}

export function isShortcodeUnique(shortcode: string, existingShortcodes: string[]): boolean {
  const isUnique = !existingShortcodes.includes(shortcode);
  Log('client', 'info', 'shortcode', `Shortcode uniqueness check: ${shortcode} - ${isUnique ? 'unique' : 'duplicate'}`);
  return isUnique;
}