
/**
 * Processes a buffer using XOR with a given key.
 * Since XOR is symmetric, this function works for both encryption and decryption.
 */
export const xorBuffer = (buffer: ArrayBuffer, key: Uint8Array): ArrayBuffer => {
  const input = new Uint8Array(buffer);
  const output = new Uint8Array(input.length);
  const keyLength = key.length;

  if (keyLength === 0) return buffer;

  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] ^ key[i % keyLength];
  }

  return output.buffer;
};

/**
 * Generates a random secure key of specified length.
 */
export const generateRandomKey = (length: number): Uint8Array => {
  const key = new Uint8Array(length);
  window.crypto.getRandomValues(key);
  return key;
};

/**
 * Converts a hex string to a Uint8Array.
 */
export const hexToUint8Array = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const matches = cleanHex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
};

/**
 * Converts a Uint8Array to a hex string.
 */
export const uint8ArrayToHex = (array: Uint8Array): string => {
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Converts a regular string to a Uint8Array (UTF-8).
 */
export const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Decodes a Uint8Array back to a string (UTF-8).
 */
export const uint8ArrayToString = (array: Uint8Array): string => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(array);
  } catch (e) {
    return "[Binary Content]";
  }
};

/**
 * Base64 Utilities
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return new Uint8Array(0);
  }
};

export const uint8ArrayToBase64 = (array: Uint8Array): string => {
  let binary = '';
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
};
