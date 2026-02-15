import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  // Derive a 32-byte key from the provided string
  return crypto.scryptSync(key, 'salt', 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex-encoded string: iv + authTag + ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // iv (32 hex) + authTag (32 hex) + ciphertext
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
export function decrypt(encryptedHex: string): string {
  const key = getEncryptionKey();

  const iv = Buffer.from(encryptedHex.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(
    encryptedHex.slice(IV_LENGTH * 2, IV_LENGTH * 2 + TAG_LENGTH * 2),
    'hex'
  );
  const encrypted = encryptedHex.slice(IV_LENGTH * 2 + TAG_LENGTH * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask an API key for display: sk-ant-api03-...xxxx
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return '****';
  return key.substring(0, 12) + '...' + key.substring(key.length - 4);
}
