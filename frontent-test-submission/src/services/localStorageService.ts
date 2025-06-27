import { Log } from '../utils/logger';

export interface ShortURL {
  id: string;
  originalUrl: string;
  shortcode: string;
  createdAt: Date;
  expiresAt: Date;
  validityMinutes: number;
  clicks: ClickRecord[];
  isActive: boolean;
}

export interface ClickRecord {
  timestamp: Date;
  userAgent: string;
  referrer: string;
  ip?: string;
  country?: string;
  city?: string;
}

const STORAGE_KEY = 'url_shortener_data';

export class LocalStorageService {
  private static instance: LocalStorageService;

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private constructor() {
    Log('client', 'info', 'localStorage', 'LocalStorageService initialized');
  }

  getAllShortURLs(): ShortURL[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        Log('client', 'info', 'localStorage', 'No existing data found');
        return [];
      }

      const parsed = JSON.parse(data);
      const shortUrls = parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        expiresAt: new Date(item.expiresAt),
        clicks: item.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));

      Log('client', 'info', 'localStorage', `Retrieved ${shortUrls.length} short URLs`);
      return shortUrls;
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error retrieving data: ${error}`);
      return [];
    }
  }

  saveShortURL(shortUrl: ShortURL): void {
    try {
      const existingUrls = this.getAllShortURLs();
      const updatedUrls = [...existingUrls, shortUrl];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUrls));
      Log('client', 'info', 'localStorage', `Saved short URL: ${shortUrl.shortcode}`);
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error saving short URL: ${error}`);
      throw new Error('Failed to save URL');
    }
  }

  saveMultipleShortURLs(shortUrls: ShortURL[]): void {
    try {
      const existingUrls = this.getAllShortURLs();
      const updatedUrls = [...existingUrls, ...shortUrls];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUrls));
      Log('client', 'info', 'localStorage', `Saved ${shortUrls.length} short URLs`);
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error saving multiple short URLs: ${error}`);
      throw new Error('Failed to save URLs');
    }
  }

  getShortURLByCode(shortcode: string): ShortURL | null {
    try {
      const allUrls = this.getAllShortURLs();
      const found = allUrls.find(url => url.shortcode === shortcode);
      
      if (found) {
        Log('client', 'info', 'localStorage', `Found short URL for code: ${shortcode}`);
      } else {
        Log('client', 'warn', 'localStorage', `Short URL not found for code: ${shortcode}`);
      }
      
      return found || null;
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error retrieving short URL: ${error}`);
      return null;
    }
  }

  recordClick(shortcode: string, clickRecord: ClickRecord): void {
    try {
      const allUrls = this.getAllShortURLs();
      const urlIndex = allUrls.findIndex(url => url.shortcode === shortcode);
      
      if (urlIndex === -1) {
        Log('client', 'warn', 'localStorage', `Cannot record click - short URL not found: ${shortcode}`);
        return;
      }

      allUrls[urlIndex].clicks.push(clickRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUrls));
      Log('client', 'info', 'localStorage', `Recorded click for: ${shortcode}`);
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error recording click: ${error}`);
    }
  }

  getExistingShortcodes(): string[] {
    try {
      const allUrls = this.getAllShortURLs();
      const shortcodes = allUrls.map(url => url.shortcode);
      Log('client', 'info', 'localStorage', `Retrieved ${shortcodes.length} existing shortcodes`);
      return shortcodes;
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error retrieving shortcodes: ${error}`);
      return [];
    }
  }

  isURLExpired(shortUrl: ShortURL): boolean {
    const isExpired = new Date() > shortUrl.expiresAt;
    if (isExpired) {
      Log('client', 'warn', 'localStorage', `URL expired: ${shortUrl.shortcode}`);
    }
    return isExpired;
  }

  getActiveShortURLs(): ShortURL[] {
    const allUrls = this.getAllShortURLs();
    const activeUrls = allUrls.filter(url => url.isActive && !this.isURLExpired(url));
    Log('client', 'info', 'localStorage', `Retrieved ${activeUrls.length} active short URLs`);
    return activeUrls;
  }

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      Log('client', 'info', 'localStorage', 'All data cleared');
    } catch (error) {
      Log('client', 'error', 'localStorage', `Error clearing data: ${error}`);
    }
  }
}