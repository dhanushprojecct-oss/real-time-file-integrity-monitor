const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chokidar = require('chokidar');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;
const WATCH_DIR = path.join(__dirname, 'monitored_files');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the monitored directory exists
    if (!fs.existsSync(WATCH_DIR)) {
      fs.mkdirSync(WATCH_DIR, { recursive: true });
    }
    cb(null, WATCH_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// In-memory storage for file hashes and logs
let fileHashes = {};
let logs = [];

// Helper to generate SHA-256 hash
const generateHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error);
    return null;
  }
};

// Log helper
const addLog = (file, action, hash, status) => {
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    file: path.relative(WATCH_DIR, file),
    action: action,
    hash: hash || 'N/A',
    status: status || 'INFO'
  };
  logs = [newLog, ...logs].slice(0, 100);
  io.emit('newLog', newLog);
  return newLog;
};

// Initialize watcher
const watcher = chokidar.watch(WATCH_DIR, {
  persistent: true,
  ignoreInitial: false
});

watcher
  .on('add', filePath => {
    const hash = generateHash(filePath);
    fileHashes[filePath] = hash;
    addLog(filePath, 'ADDED', hash, 'SAFE');
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: 'SAFE'
    })));
  })
  .on('change', filePath => {
    const newHash = generateHash(filePath);
    const oldHash = fileHashes[filePath];
    let status = 'SAFE';

    if (oldHash && newHash !== oldHash) {
      status = 'CRITICAL';
    }

    fileHashes[filePath] = newHash;
    addLog(filePath, 'MODIFIED', newHash, status);
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: p === filePath ? status : 'SAFE'
    })));
  })
  .on('unlink', filePath => {
    delete fileHashes[filePath];
    addLog(filePath, 'DELETED', null, 'WARNING');
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: 'SAFE'
    })));
  });

// API Endpoints
app.get('/status', (req, res) => {
  res.json({
    status: 'ACTIVE',
    monitoredCount: Object.keys(fileHashes).length,
    timestamp: new Date().toISOString()
  });
});

app.get('/logs', (req, res) => {
  res.json(logs);
});

app.get('/files', (req, res) => {
  const fileList = Object.keys(fileHashes).map(p => ({
    path: path.relative(WATCH_DIR, p),
    hash: fileHashes[p],
    status: 'SAFE'
  }));
  res.json(fileList);
});

// Upload files
app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  res.json({ success: true, count: req.files.length });
});

// Get file content
app.get('/file/content', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  const safePath = path.resolve(WATCH_DIR, filePath);
  if (!safePath.startsWith(WATCH_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const ext = path.extname(safePath).toLowerCase();
    const textExtensions = ['.txt', '.json', '.js', '.jsx', '.html', '.css', '.md', '.yml', '.yaml', '.ini', '.conf', '.xml', '.csv', '.log'];
    
    let isBinary = false;
    const buffer = fs.readFileSync(safePath);
    if (!textExtensions.includes(ext)) {
      isBinary = buffer.some(byte => byte === 0);
    }
    
    if (isBinary) {
      return res.json({ path: filePath, isBinary: true, content: '[Binary content - Editing not supported]' });
    }
    
    // Support UTF-16LE or UTF-8 decoding based on encoding detection or fallback
    let fileContent;
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
      fileContent = buffer.toString('utf-16le');
    } else if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
      // Big endian UTF-16, swap bytes for Node.js if needed or just output standard
      fileContent = buffer.toString('utf-16be');
    } else {
      fileContent = buffer.toString('utf-8');
    }
    
    res.json({ path: filePath, isBinary: false, content: fileContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit file content
app.post('/file/edit', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'Path and content are required' });
  }

  const safePath = path.resolve(WATCH_DIR, filePath);
  if (!safePath.startsWith(WATCH_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    fs.writeFileSync(safePath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete('/file/delete', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  const safePath = path.resolve(WATCH_DIR, filePath);
  if (!safePath.startsWith(WATCH_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// On-demand filesystem integrity scan
app.post('/scan', (req, res) => {
  try {
    if (!fs.existsSync(WATCH_DIR)) {
      fs.mkdirSync(WATCH_DIR, { recursive: true });
    }
    const filesOnDisk = fs.readdirSync(WATCH_DIR);
    const scannedFiles = {};
    
    // Calculate new hashes and detect add/change
    for (const filename of filesOnDisk) {
      const filePath = path.join(WATCH_DIR, filename);
      if (fs.statSync(filePath).isDirectory()) continue;

      const newHash = generateHash(filePath);
      scannedFiles[filePath] = newHash;

      const oldHash = fileHashes[filePath];
      if (!oldHash) {
        fileHashes[filePath] = newHash;
        addLog(filePath, 'ADDED', newHash, 'SAFE');
      } else if (newHash !== oldHash) {
        fileHashes[filePath] = newHash;
        addLog(filePath, 'MODIFIED', newHash, 'CRITICAL');
      }
    }

    // Detect deleted
    for (const filePath of Object.keys(fileHashes)) {
      if (!scannedFiles[filePath]) {
        delete fileHashes[filePath];
        addLog(filePath, 'DELETED', null, 'WARNING');
      }
    }

    // Emit updated files list
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: 'SAFE'
    })));

    res.json({ success: true, count: Object.keys(fileHashes).length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Manual scan error:", error);
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`FIM Backend running on http://localhost:${PORT}`);
  console.log(`Monitoring directory: ${WATCH_DIR}`);
});
