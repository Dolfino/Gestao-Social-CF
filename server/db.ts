import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { hashPassword } from './crypto.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'centrofashion.db');

let dbInstance: Database | null = null;

/**
 * Salva o banco SQLite em disco de forma síncrona para garantir persistência após reinício de processo
 */
export function persistDb(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const binaryArray = dbInstance.export();
    const buffer = Buffer.from(binaryArray);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('[DATABASE] Falha ao persistir banco SQLite em disco:', err);
  }
}

/**
 * Inicializa a estrutura do banco e tabelas necessárias
 */
function initializeTables(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta_config (
      id TEXT PRIMARY KEY,
      app_id TEXT,
      app_secret_encrypted TEXT,
      app_secret_iv TEXT,
      app_secret_auth_tag TEXT,
      instagram_app_id TEXT,
      instagram_app_secret_encrypted TEXT,
      instagram_app_secret_iv TEXT,
      instagram_app_secret_auth_tag TEXT,
      api_version TEXT DEFAULT 'v22.0',
      webhook_verify_token TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      auth_flow TEXT NOT NULL,
      account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      username TEXT,
      profile_picture_url TEXT,
      token_encrypted TEXT,
      token_iv TEXT,
      token_auth_tag TEXT,
      token_type TEXT,
      token_expires_at TEXT,
      linked_page_id TEXT,
      linked_instagram_id TEXT,
      status TEXT DEFAULT 'authorized',
      connected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      flow TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_token_hash TEXT,
      redirect_uri TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      auth_code TEXT,
      pending_data_json TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      role TEXT,
      action TEXT NOT NULL,
      flow_type TEXT,
      endpoint TEXT,
      http_status INTEGER,
      resource_id TEXT,
      details_json TEXT,
      ip TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS data_deletion_requests (
      id TEXT PRIMARY KEY,
      confirmation_code TEXT UNIQUE NOT NULL,
      meta_user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      requested_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      identifier TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 1,
      last_attempt_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_publications (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      flow TEXT NOT NULL,
      account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      media_url TEXT NOT NULL,
      media_type TEXT DEFAULT 'IMAGE',
      caption TEXT,
      container_id TEXT,
      meta_media_id TEXT,
      permalink TEXT,
      status TEXT NOT NULL,
      idempotency_key TEXT UNIQUE,
      error_details TEXT,
      created_by_user_id TEXT,
      created_by_user_name TEXT,
      created_at TEXT NOT NULL,
      published_at TEXT
    );
  `);

  // Migrações automáticas para tabelas já existentes
  const migrations = [
    'ALTER TABLE meta_config ADD COLUMN instagram_app_id TEXT;',
    'ALTER TABLE meta_config ADD COLUMN instagram_app_secret_encrypted TEXT;',
    'ALTER TABLE meta_config ADD COLUMN instagram_app_secret_iv TEXT;',
    'ALTER TABLE meta_config ADD COLUMN instagram_app_secret_auth_tag TEXT;',
    'ALTER TABLE social_accounts ADD COLUMN linked_page_id TEXT;',
    'ALTER TABLE social_accounts ADD COLUMN linked_instagram_id TEXT;',
    'ALTER TABLE oauth_states ADD COLUMN session_token_hash TEXT;',
    'ALTER TABLE oauth_states ADD COLUMN auth_code TEXT;',
    'ALTER TABLE oauth_states ADD COLUMN pending_data_json TEXT;',
    'ALTER TABLE social_accounts ADD COLUMN token_expires_at TEXT;',
    'ALTER TABLE social_accounts ADD COLUMN permissions_granted TEXT;',
    'ALTER TABLE social_accounts ADD COLUMN metadata_json TEXT;',
  ];

  for (const mig of migrations) {
    try {
      db.run(mig);
    } catch {
      // Ignora se a coluna já existir
    }
  }
  // Remove credenciais fictícias de testes anteriores (ex: 987654321012345)
  try {
    db.run("UPDATE meta_config SET app_id = '', app_secret_encrypted = '', app_secret_iv = '', app_secret_auth_tag = '' WHERE app_id = '987654321012345'");
  } catch {
    // Ignora se não existir
  }

  // Verifica se há usuários cadastrados; caso negativo, cadastra os perfis com credenciais iniciais
  const userCountRes = db.exec("SELECT COUNT(*) as cnt FROM users");
  const count = userCountRes.length > 0 && userCountRes[0].values.length > 0 ? Number(userCountRes[0].values[0][0]) : 0;

  if (count === 0) {
    const now = new Date().toISOString();
    
    // 1. Administrador Centro Fashion (Acesso total a credenciais e configurações)
    const adminPass = hashPassword('Admin@CentroFashion2026!');
    db.run(
      "INSERT INTO users (id, name, email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ['usr_admin_01', 'Administrador Centro Fashion', 'admin@centrofashion.com.br', adminPass.hash, adminPass.salt, 'admin', now]
    );

    // 2. Operador Social (Equipe operacional - postagens, comentários e atendimento)
    const opPass = hashPassword('Operador@CentroFashion2026!');
    db.run(
      "INSERT INTO users (id, name, email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ['usr_operador_01', 'Equipe Social Centro Fashion', 'operador@centrofashion.com.br', opPass.hash, opPass.salt, 'operator', now]
    );

    // 3. Avaliador Meta App Review (Reviewer dedicado para inspeção e auditoria)
    const revPass = hashPassword('MetaReviewer2026!');
    db.run(
      "INSERT INTO users (id, name, email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ['usr_reviewer_01', 'Avaliador Meta App Review', 'reviewer@meta.com', revPass.hash, revPass.salt, 'reviewer', now]
    );

    console.log('[DATABASE] Usuários iniciais com papéis (admin, operator, reviewer) criados com sucesso.');
  }

  // Verifica se existe registro singleton de configuração da Meta
  const configRes = db.exec("SELECT COUNT(*) as cnt FROM meta_config WHERE id = 'default'");
  const configCount = configRes.length > 0 && configRes[0].values.length > 0 ? Number(configRes[0].values[0][0]) : 0;
  if (configCount === 0) {
    db.run(
      "INSERT INTO meta_config (id, app_id, api_version, webhook_verify_token, updated_at) VALUES (?, ?, ?, ?, ?)",
      ['default', '', 'v22.0', 'cf_verify_token_2026_webhook', new Date().toISOString()]
    );
  }
}

/**
 * Obtém ou inicializa a conexão do banco de dados
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      initializeTables(dbInstance);
      console.log('[DATABASE] Banco SQLite carregado a partir de:', DB_PATH);
      return dbInstance;
    } catch (err) {
      console.error('[DATABASE] Erro ao carregar arquivo existente, inicializando novo:', err);
    }
  }

  dbInstance = new SQL.Database();
  initializeTables(dbInstance);
  persistDb();
  console.log('[DATABASE] Novo banco SQLite criado em:', DB_PATH);
  return dbInstance;
}

/**
 * Utilitário para executar consultas SELECT e retornar array de objetos
 */
export function queryAll<T = Record<string, unknown>>(db: Database, sql: string, params: (string | number | null)[] = []): T[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

/**
 * Utilitário para executar consulta que retorna apenas 1 linha
 */
export function queryOne<T = Record<string, unknown>>(db: Database, sql: string, params: (string | number | null)[] = []): T | null {
  const rows = queryAll<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}
