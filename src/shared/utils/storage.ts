/**
 * @file storage.ts
 * @description Cross-platform storage utility - uses SecureStore on native, localStorage on web
 * 
 * @principles
 * - SRP: ✅ Single responsibility: platform-agnostic storage operations
 * - DIP: ✅ Abstracts storage implementation details
 * - Platform Compatibility: ✅ Works on both native and web platforms
 * 
 * @functions
 * - getItem(key: string): Promise<string | null> - Get item from storage
 * - setItem(key: string, value: string): Promise<void> - Set item in storage
 * - deleteItem(key: string): Promise<void> - Delete item from storage
 * 
 * @notes
 * - Native: Uses expo-secure-store for secure token storage
 * - Web: Uses localStorage for token storage (acceptable for web)
 * - All operations are async for consistency across platforms
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Get item from storage (platform-aware)
 */
export const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`[Storage] Error getting item from localStorage:`, error);
      return null;
    }
  }
  
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[Storage] Error getting item from SecureStore:`, error);
    return null;
  }
};

/**
 * Set item in storage (platform-aware)
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage] Error setting item in localStorage:`, error);
      throw error;
    }
    return;
  }
  
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`[Storage] Error setting item in SecureStore:`, error);
    throw error;
  }
};

/**
 * Delete item from storage (platform-aware)
 */
export const deleteItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error deleting item from localStorage:`, error);
      throw error;
    }
    return;
  }
  
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`[Storage] Error deleting item from SecureStore:`, error);
    throw error;
  }
};

