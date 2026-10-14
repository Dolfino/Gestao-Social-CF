import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.js';
import { getDb } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = 3000;

  // Middlewares para requisições JSON e urlencoded (compatível com webhooks, fotos em base64 e signed_request da Meta)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Servir pasta de mídias públicas enviadas com cabeçalhos CORS permitindo scrapers da Meta
  const uploadsDir = path.resolve(__dirname, 'uploads');
  app.get('/uploads/:filename', (req, res, next) => {
    const filename = req.params.filename;
    const requestedPath = path.resolve(uploadsDir, filename);

    // Se a Meta ou o cliente solicitar .png mas existir a versão .jpg oficial, entrega o JPEG
    if (filename.toLowerCase().endsWith('.png') && !fs.existsSync(requestedPath)) {
      const jpgPath = path.resolve(uploadsDir, filename.replace(/\.png$/i, '.jpg'));
      if (fs.existsSync(jpgPath)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(jpgPath);
      }
    }
    next();
  });

  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
    }
  }));

  // Inicializa e verifica o banco de dados SQLite persistente
  await getDb();

  // Montagem das rotas da API oficial
  app.use('/api', apiRouter);

  // Garantir que nenhuma rota /api/* caia no middleware SPA do Vite (impedindo respostas em HTML)
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'ROTA_NAO_ENCONTRADA: O endpoint da API solicitado não existe.' });
  });

  // Montagem do Vite no modo dev ou estáticos no modo produção
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const viteDepsDir = path.resolve(__dirname, 'node_modules', '.vite', 'deps');
    const reactDep = path.join(viteDepsDir, 'react.js');
    if (!fs.existsSync(reactDep)) {
      try {
        console.log('[SERVER] Pré-otimizando dependências do Vite...');
        execSync('npx vite optimize', { stdio: 'inherit' });
      } catch (err) {
        console.warn('[SERVER] Aviso na otimização prévia:', err);
      }
    }

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Vite middlewares gerencia o carregamento e reescrita de módulos pré-otimizados
    app.use(vite.middlewares);

    // Fallback garantido para entrega de index.html APENAS para navegações de página (evitando MIME type text/html em scripts)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (
        url.startsWith('/api') ||
        url.startsWith('/uploads') ||
        url.startsWith('/node_modules') ||
        url.startsWith('/@') ||
        url.startsWith('/src') ||
        /\.[a-zA-Z0-9]+(\?.*)?$/.test(url)
      ) {
        return next();
      }

      // Apenas requisições GET para páginas HTML
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Centro Fashion Fortaleza backend em execução na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER_FATAL] Erro ao iniciar servidor:', err);
  process.exit(1);
});
