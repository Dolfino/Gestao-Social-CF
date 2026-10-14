import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Módulo de Criptografia e Segurança do Centro Fashion Fortaleza
 * - Chave de criptografia permanente obrigatória via variável APP_ENCRYPTION_KEY (32 bytes hex).
 * - Se a chave estiver ausente ou inválida: NUNCA gera chave efêmera; bloqueia o uso de segredos.
 * - Hashing de senhas com PBKDF2 (SHA-512, 100.000 iterações e salt aleatório de 16 bytes).
 * - Validação de assinatura HMAC-SHA256 para Webhooks da Meta e Data Deletion signed_request.
 */

/**
 * Recupera o buffer da chave permanente AES-256 de forma dinâmica e segura,
 * tolerando aspas e espaços acidentais nas variáveis de ambiente.
 */
export function getEncryptionKeyBuffer(): { buffer: Buffer | null; error: string | null } {
  let raw = (process.env.APP_ENCRYPTION_KEY || '').trim();
  
  // Remove aspas simples ou duplas envolventes caso tenham sido adicionadas no .env
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }

  if (!raw) {
    return {
      buffer: null,
      error: 'Variável de ambiente APP_ENCRYPTION_KEY não encontrada no servidor.',
    };
  }

  try {
    if (raw.length === 64) {
      const buf = Buffer.from(raw, 'hex');
      if (buf.length === 32) {
        return { buffer: buf, error: null };
      }
      return { buffer: null, error: 'Chave hex inválida (não resultou em 32 bytes).' };
    } else if (raw.length === 32) {
      return { buffer: Buffer.from(raw, 'utf-8'), error: null };
    } else {
      return {
        buffer: null,
        error: `A chave APP_ENCRYPTION_KEY possui ${raw.length} caracteres; deve conter exatamente 32 bytes (64 caracteres hexadecimais).`,
      };
    }
  } catch (err) {
    return { buffer: null, error: 'Falha ao decodificar APP_ENCRYPTION_KEY: ' + String(err) };
  }
}

export function isEncryptionConfigured(): boolean {
  const { buffer } = getEncryptionKeyBuffer();
  return buffer !== null && buffer.length === 32;
}

export function getEncryptionStatus(): { configured: boolean; message: string } {
  const { buffer, error } = getEncryptionKeyBuffer();
  if (buffer && buffer.length === 32) {
    return {
      configured: true,
      message: 'Chave de criptografia permanente AES-256-GCM ativa e válida.',
    };
  }
  return {
    configured: false,
    message: error || 'Chave de criptografia permanente não configurada.',
  };
}

/**
 * Criptografa dados sensíveis utilizando AES-256-GCM com IV aleatório de 12 bytes.
 */
export function encryptSecret(plainText: string): { iv: string; authTag: string; data: string } {
  const { buffer, error } = getEncryptionKeyBuffer();
  if (!buffer || buffer.length !== 32) {
    throw new Error('OPERACAO_BLOQUEADA: ' + (error || 'APP_ENCRYPTION_KEY não configurada.'));
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', buffer, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    authTag,
    data: encrypted,
  };
}

/**
 * Descriptografa dados com verificação de integridade AES-256-GCM.
 */
export function decryptSecret(encryptedPayload: { iv: string; authTag: string; data: string }): string {
  const { buffer, error } = getEncryptionKeyBuffer();
  if (!buffer || buffer.length !== 32) {
    throw new Error('OPERACAO_BLOQUEADA: ' + (error || 'APP_ENCRYPTION_KEY não configurada.'));
  }

  const iv = Buffer.from(encryptedPayload.iv, 'hex');
  const authTag = Buffer.from(encryptedPayload.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', buffer, iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedPayload.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mascara strings sensíveis preservando apenas os 4 últimos caracteres
 */
export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '';
  if (secret.length <= 4) return '••••';
  const lastFour = secret.slice(-4);
  return '••••••••' + lastFour;
}

/**
 * Gera hash seguro de senha utilizando PBKDF2 (SHA-512 com 100.000 iterações)
 */
export function hashPassword(password: string, customSalt?: string): { salt: string; hash: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

/**
 * Validação de Assinatura de Webhooks da Meta (X-Hub-Signature-256)
 */
export function verifyMetaWebhookSignature(rawBody: string | Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader || !appSecret) return false;
  
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;
  
  const expectedSig = parts[1];
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(rawBody);
  const calculatedSig = hmac.digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSig, 'hex'), Buffer.from(calculatedSig, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Decodifica e valida criptograficamente o signed_request da Meta para Data Deletion
 */
export function parseAndVerifySignedRequest(signedRequest: string, appSecret: string): { user_id: string; algorithm: string; issued_at: number } {
  if (!signedRequest || typeof signedRequest !== 'string') {
    throw new Error('signed_request ausente ou em formato inválido.');
  }

  const parts = signedRequest.split('.');
  if (parts.length !== 2) {
    throw new Error('signed_request malformado: esperado signature.payload');
  }

  const [encodedSig, encodedPayload] = parts;

  // Base64URL decode signature
  const sigBuffer = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  
  // Base64URL decode payload
  const payloadJson = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);

  if (payload.algorithm !== 'HMAC-SHA256') {
    throw new Error(`Algoritmo não suportado: ${payload.algorithm}. Esperado HMAC-SHA256.`);
  }

  // Valida HMAC-SHA256
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(encodedPayload);
  const expectedSigBuffer = hmac.digest();

  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    throw new Error('Assinatura HMAC do signed_request inválida. Solicitação rejeitada.');
  }

  return {
    user_id: payload.user_id,
    algorithm: payload.algorithm,
    issued_at: payload.issued_at,
  };
}

/**
 * Cria um state OAuth assinado criptograficamente com HMAC-SHA256 vinculado ao usuário e ao hash da sessão
 */
export function createOAuthState(flowPrefix: 'fb' | 'ig', userId: string, sessionTokenHash: string): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const rawPayload = `${userId}.${sessionTokenHash}.${timestamp}.${nonce}`;
  const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'cf_internal_session_secret').update(rawPayload).digest('hex');
  return `${flowPrefix}.${rawPayload}.${sig}`;
}

/**
 * Valida a integridade criptográfica do state OAuth (HMAC-SHA256)
 */
export function verifyOAuthStateSignature(stateStr: string, expectedPrefix: 'fb' | 'ig'): { valid: boolean; userId?: string; tokenHash?: string; timestamp?: number } {
  if (!stateStr || typeof stateStr !== 'string') return { valid: false };
  const parts = stateStr.split('.');
  if (parts.length !== 6 || parts[0] !== expectedPrefix) return { valid: false };
  const [, userId, tokenHash, tsStr, nonce, sig] = parts;
  const rawPayload = `${userId}.${tokenHash}.${tsStr}.${nonce}`;
  const expectedSig = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'cf_internal_session_secret').update(rawPayload).digest('hex');
  try {
    const isSigValid = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
    if (!isSigValid) return { valid: false };
    return { valid: true, userId, tokenHash, timestamp: Number(tsStr) };
  } catch {
    return { valid: false };
  }
}
