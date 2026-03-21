/**
 * nativeServices.js
 * 
 * A unified wrapper around Capacitor native plugins.
 * Use these helpers throughout the app instead of importing
 * Capacitor plugins directly — makes it easy to fall back
 * gracefully when running in a browser (dev mode).
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { CapacitorHttp } from '@capacitor/core';

// ─── Platform Detection ───────────────────────────────────────────────────────

export const isNative = () => Capacitor.isNativePlatform();

// ─── Secure Storage ───────────────────────────────────────────────────────────

/**
 * Save a value securely (AES-256 via Android Keystore / iOS Keychain).
 * Falls back to localStorage in browser.
 */
export async function secureSet(key, value) {
  if (isNative()) {
    await SecureStoragePlugin.set({ key, value: String(value) });
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * Read a securely stored value.
 * Falls back to localStorage in browser.
 */
export async function secureGet(key) {
  if (isNative()) {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch {
      return null;
    }
  } else {
    return localStorage.getItem(key);
  }
}

/**
 * Remove a securely stored value.
 */
export async function secureRemove(key) {
  if (isNative()) {
    await SecureStoragePlugin.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
}

// ─── Preferences (non-sensitive app state) ───────────────────────────────────

/**
 * Save a non-sensitive preference (persists across app restarts).
 */
export async function prefSet(key, value) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

/**
 * Read a preference.
 */
export async function prefGet(key) {
  const { value } = await Preferences.get({ key });
  return value ? JSON.parse(value) : null;
}

/**
 * Remove a preference.
 */
export async function prefRemove(key) {
  await Preferences.remove({ key });
}

// ─── File / Video Download ────────────────────────────────────────────────────

/**
 * Download a file (e.g. a video) from a URL and save it to
 * the device's Documents directory.
 * 
 * @param {string} url         - Remote URL of the file to download
 * @param {string} fileName    - Name to save the file as (e.g. "video.mp4")
 * @param {function} onProgress - Optional callback({ loaded, total, percent })
 * @returns {string}           - URI of the saved file
 */
export async function downloadFile(url, fileName, onProgress) {
  if (isNative()) {
    // On native: use CapacitorHttp to fetch as blob then write to disk
    const response = await CapacitorHttp.request({
      url,
      method: 'GET',
      responseType: 'blob',
    });

    const result = await Filesystem.writeFile({
      path: `downloads/${fileName}`,
      data: response.data,
      directory: Directory.Documents,
      recursive: true,
    });

    return result.uri;
  } else {
    // Browser fallback: use anchor download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return url;
  }
}

/**
 * Read a file from the Documents directory.
 */
export async function readFile(path) {
  const result = await Filesystem.readFile({
    path,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
  return result.data;
}

/**
 * Delete a file from the Documents directory.
 */
export async function deleteFile(path) {
  await Filesystem.deleteFile({
    path,
    directory: Directory.Documents,
  });
}

/**
 * List all files in a directory within Documents.
 */
export async function listFiles(dir = 'downloads') {
  const result = await Filesystem.readdir({
    path: dir,
    directory: Directory.Documents,
  });
  return result.files;
}

/**
 * Get the full native URI for a file (to play video, etc.)
 */
export async function getFileUri(path) {
  const result = await Filesystem.getUri({
    path,
    directory: Directory.Documents,
  });
  return result.uri;
}

/**
 * Check if a file exists in Documents.
 */
export async function fileExists(path) {
  try {
    await Filesystem.stat({ path, directory: Directory.Documents });
    return true;
  } catch {
    return false;
  }
}
