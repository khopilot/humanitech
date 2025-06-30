import { StateStorage } from 'zustand/middleware';

// Simple encryption/decryption for demo purposes
// In production, use a proper encryption library
const encrypt = (text: string): string => {
  return btoa(text);
};

const decrypt = (text: string): string => {
  try {
    return atob(text);
  } catch {
    return '';
  }
};

// Secure storage that uses sessionStorage instead of localStorage
export const secureStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const encrypted = sessionStorage.getItem(name);
      if (!encrypted) return null;
      
      const decrypted = decrypt(encrypted);
      return decrypted;
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    try {
      const encrypted = encrypt(value);
      sessionStorage.setItem(name, encrypted);
    } catch (error) {
      console.error('Error writing to secure storage:', error);
    }
  },
  
  removeItem: (name: string): void => {
    sessionStorage.removeItem(name);
  },
};

// CSRF token management
export const getCSRFToken = (): string | null => {
  // Try to get from meta tag first
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) return metaToken;
  
  // Try to get from cookie
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1];
    
  return cookieToken || null;
};

// Set CSRF token in meta tag
export const setCSRFToken = (token: string): void => {
  let metaTag = document.querySelector('meta[name="csrf-token"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'csrf-token');
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', token);
};