import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API Backend
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'La Tierrita - Colombianos en España',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Servir los archivos estáticos de la aplicación (dist de Vite)
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Soporte para navegación SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 [La Tierrita] Servidor backend y frontend escuchando en http://${HOST}:${PORT}`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${distPath}`);
});
