/**
 * Sanitização Estruturada e Rastreamento de Auditoria do Centro Fashion Fortaleza
 * - Allowlist estrita de propriedades permitidas nos registros.
 * - Descarte completo de parâmetros sensíveis (tokens, segredos, senhas, cabeçalhos de autorização).
 * - Purgação de parâmetros de URL para evitar vazamento de access_token em query strings.
 */

// Lista de campos permitidos explicitamente na gravação de detalhes
const ALLOWED_DETAIL_KEYS = new Set([
  'action',
  'account_id',
  'account_type',
  'aspect_ratio',
  'auth_flow',
  'code',
  'confirmation_code',
  'count',
  'details',
  'endpoint',
  'error_type',
  'flow',
  'format',
  'height',
  'http_status',
  'id',
  'ip',
  'media_url',
  'message',
  'name',
  'page_id',
  'platform',
  'resource_id',
  'role',
  'status',
  'target_id',
  'timestamp',
  'username',
  'width',
]);

// Termos estritamente proibidos em qualquer nível da árvore de dados
const SENSITIVE_KEYWORDS = [
  'token',
  'secret',
  'password',
  'senha',
  'credential',
  'authorization',
  'signed_request',
  'cookie',
  'private_key',
  'encryption_key',
  'bearer',
];

/**
 * Higieniza URLs removendo parâmetros de consulta sensíveis
 */
export function sanitizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  try {
    const urlObj = new URL(rawUrl, 'http://localhost');
    const safeSearchParams = new URLSearchParams();
    
    urlObj.searchParams.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYWORDS.some((term) => lowerKey.includes(term));
      if (!isSensitive) {
        safeSearchParams.set(key, value);
      } else {
        safeSearchParams.set(key, '[REDACTED]');
      }
    });

    urlObj.search = safeSearchParams.toString();
    // Retorna a URL limpa (preserva o pathname e busca higienizada)
    return rawUrl.startsWith('http') ? urlObj.toString() : urlObj.pathname + (urlObj.search ? urlObj.search : '');
  } catch {
    // Se a URL não for parseável por URL(), remove manualmente por regex preventiva
    return rawUrl.replace(/([?&](access_token|client_secret|code|secret)=)[^&]+/gi, '$1[REDACTED]');
  }
}

/**
 * Sanitiza recursivamente objetos e payloads com base na allowlist estrita
 */
export function sanitizeStructuredPayload(input: unknown, depth = 0): unknown {
  if (depth > 4 || input === null || input === undefined) return null;

  if (typeof input === 'string') {
    // Se a string contiver indícios de token longo ou segredo, não gravar
    if (input.length > 256 && !input.startsWith('http')) {
      return '[TRUNCATED_STRING]';
    }
    return input;
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.slice(0, 20).map((item) => sanitizeStructuredPayload(item, depth + 1));
  }

  if (typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      // Bloqueio imediato se o nome da chave contiver termo sensível
      const isSensitive = SENSITIVE_KEYWORDS.some((term) => lowerKey.includes(term));
      if (isSensitive) {
        continue; // Descarta sumariamente a propriedade
      }

      // Allowlist: aceita apenas se estiver na lista autorizada
      if (ALLOWED_DETAIL_KEYS.has(lowerKey)) {
        sanitizedObj[key] = sanitizeStructuredPayload(value, depth + 1);
      }
    }

    return sanitizedObj;
  }

  return null;
}
