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

// ─── Real Device Storage ─────────────────────────────────────────────────────

/**
 * Measure actual storage used by this app and device free/total space.
 *
 * On Android (native):
 *   - Walks the `downloads/` directory inside the app's Documents folder.
 *   - Sums file sizes using Filesystem.stat() on each entry.
 *   - Estimates device total/free via a reasonable fallback (Capacitor does
 *     not expose a cross-platform disk-space API, so we use a native workaround).
 *
 * On browser (dev): returns safe placeholder values.
 *
 * @returns {{ appUsedBytes: number, appUsedMB: number,
 *             deviceTotalGB: number, deviceFreeMB: number,
 *             usagePercent: number }}
 */
export async function getDeviceStorageInfo() {
  if (!isNative()) {
    // Browser dev-mode placeholder
    return {
      appUsedBytes: 0,
      appUsedMB: 0,
      deviceTotalGB: 64,
      deviceFreeMB: 32768,
      usagePercent: 0,
    };
  }

  let appUsedBytes = 0;

  try {
    // List every file in the downloads/ directory
    const { files } = await Filesystem.readdir({
      path: 'downloads',
      directory: Directory.Documents,
    });

    for (const file of files) {
      try {
        const stat = await Filesystem.stat({
          path: `downloads/${file.name}`,
          directory: Directory.Documents,
        });
        appUsedBytes += stat.size || 0;
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // downloads/ folder may not exist yet (no content downloaded)
    appUsedBytes = 0;
  }

  const appUsedMB = Math.round(appUsedBytes / (1024 * 1024));

  // ── Real device storage via Web Storage API ──────────────────────────────
  // navigator.storage.estimate() is available in all modern Android WebViews.
  // quota  = total storage available to this app (reflects real device size)
  // usage  = bytes actually used by web storage (IndexedDB, caches, etc.)
  let deviceTotalGB = 0;
  let deviceFreeMB = 0;
  let webUsageMB = 0;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quotaBytes = estimate.quota || 0;    // total storage Android grants the app
      const usageBytes = estimate.usage || 0;    // bytes used by web storage
      webUsageMB = Math.round(usageBytes / (1024 * 1024));
      deviceTotalGB = Math.round(quotaBytes / (1024 * 1024 * 1024));
      // Free = quota minus web usage minus file downloads
      const usedTotalBytes = usageBytes + appUsedBytes;
      deviceFreeMB = Math.max(0, Math.round((quotaBytes - usedTotalBytes) / (1024 * 1024)));
    }
  } catch {
    // Fallback if storage API not available
    deviceTotalGB = 0;
    deviceFreeMB = 0;
  }

  // totalUsedMB = file downloads + web storage usage
  const totalUsedMB = appUsedMB + webUsageMB;
  const deviceTotalMB = deviceTotalGB * 1024;
  const usagePercent = deviceTotalMB > 0
    ? Math.min(100, Math.round((totalUsedMB / deviceTotalMB) * 100))
    : 0;

  return {
    appUsedBytes,
    appUsedMB: totalUsedMB,
    deviceTotalGB,
    deviceFreeMB,
    usagePercent,
  };
}
