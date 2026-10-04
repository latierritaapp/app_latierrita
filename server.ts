import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

const dataFilePath = path.resolve(__dirname, 'data', 'info-sections.json');

// Helper to read sections
function readSections() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dataDir = path.dirname(dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      return [];
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading info sections:', err);
    return [];
  }
}

// Helper to write sections
function writeSections(sections: any[]) {
  try {
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(sections, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing info sections:', err);
  }
}

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

// GET /api/info-sections
app.get('/api/info-sections', (req, res) => {
  const sections = readSections();
  res.json(sections);
});

// POST /api/info-sections
app.post('/api/info-sections', (req, res) => {
  const newSection = req.body;
  if (!newSection || !newSection.title) {
    return res.status(400).json({ error: 'Título requerido' });
  }
  const sections = readSections();
  const filtered = sections.filter(s => s.id !== newSection.id);
  const updated = [newSection, ...filtered];
  writeSections(updated);
  res.status(201).json(newSection);
});

// PUT /api/info-sections/:id
app.put('/api/info-sections/:id', (req, res) => {
  const { id } = req.params;
  const updatedSection = req.body;
  const sections = readSections();
  const index = sections.findIndex(s => s.id === id);
  if (index >= 0) {
    sections[index] = { ...sections[index], ...updatedSection };
  } else {
    sections.unshift(updatedSection);
  }
  writeSections(sections);
  res.json(updatedSection);
});

// DELETE /api/info-sections/:id
app.delete('/api/info-sections/:id', (req, res) => {
  const { id } = req.params;
  const sections = readSections();
  const filtered = sections.filter(s => s.id !== id);
  writeSections(filtered);
  res.json({ success: true, id });
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
  console.log(`📑 Almacén de secciones informativas en: ${dataFilePath}`);
});
