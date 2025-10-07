// Deep linking utilities for shareable URLs

/**
 * Generate a shareable link for a mandala
 * @param {number} mandalaNumber - Mandala number (1-10)
 * @returns {string} Full URL
 */
export const getMandalaLink = (mandalaNumber) => {
  return `${window.location.origin}/mandala/${mandalaNumber}`;
};

/**
 * Generate a shareable link for a specific hymn
 * @param {number} mandala - Mandala number
 * @param {number} hymn - Hymn number
 * @param {number} verse - Verse number (optional)
 * @returns {string} Full URL
 */
export const getHymnLink = (mandala, hymn, verse = null) => {
  const base = `${window.location.origin}/hymn/${mandala}.${hymn}`;
  return verse ? `${base}.${verse}` : base;
};

/**
 * Generate a shareable link for a deity
 * @param {string} deityName - Name of the deity
 * @returns {string} Full URL
 */
export const getDeityLink = (deityName) => {
  const normalized = deityName.toLowerCase().replace(/\s+/g, '-');
  return `${window.location.origin}/deity/${normalized}`;
};

/**
 * Parse a hymn reference from URL format
 * @param {string} hymnRef - Format: "mandala.hymn" or "mandala.hymn.verse"
 * @returns {object} Parsed reference with mandala, hymn, and optional verse
 */
export const parseHymnReference = (hymnRef) => {
  const parts = hymnRef.split('.').map(Number);
  return {
    mandala: parts[0] || null,
    hymn: parts[1] || null,
    verse: parts[2] || null,
  };
};

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Generate QR code data URL (placeholder - would need qrcode library)
 * @param {string} url - URL to encode
 * @returns {Promise<string>} Data URL for QR code
 */
export const generateQRCode = async (url) => {
  // This is a placeholder - you would use a library like 'qrcode' for actual implementation
  // For now, return a placeholder
  console.log('QR Code would be generated for:', url);
  return null;
};
