import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

// Dev middleware to handle /api/info-sections in Vite dev server
function infoSectionsApiPlugin(): Plugin {
  const dataFilePath = path.resolve(__dirname, 'data', 'info-sections.json');

  const readData = () => {
    try {
      if (!fs.existsSync(dataFilePath)) return [];
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  };

  const writeData = (data: any) => {
    try {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(e);
    }
  };

  return {
    name: 'info-sections-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/info-sections')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;
        const id = pathname.replace('/api/info-sections', '').replace(/^\//, '');

        if (req.method === 'GET' && !id) {
          const sections = readData();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(sections));
          return;
        }

        // Buffer body for POST/PUT
        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const sections = readData();
              if (req.method === 'POST') {
                const filtered = sections.filter((s: any) => s.id !== parsed.id);
                const updated = [parsed, ...filtered];
                writeData(updated);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 201;
                res.end(JSON.stringify(parsed));
              } else {
                const targetId = id || parsed.id;
                const idx = sections.findIndex((s: any) => s.id === targetId);
                if (idx >= 0) sections[idx] = { ...sections[idx], ...parsed };
                else sections.unshift(parsed);
                writeData(sections);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(parsed));
              }
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE' && id) {
          const sections = readData();
          const filtered = sections.filter((s: any) => s.id !== id);
          writeData(filtered);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, id }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), infoSectionsApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
