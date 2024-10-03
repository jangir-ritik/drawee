const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const sharp = require('sharp');
const os = require('os');

const app = express();

// Use memory storage instead of disk
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only .png, .jpg and .jpeg files are allowed!'), false);
    }
    cb(null, true);
  }
});

app.use(cors());

// Use the system's temporary directory
const tmpDir = os.tmpdir();

app.post('/upload', upload.array('images'), async (req, res) => {
  const files = req.files;
  const convertedFiles = [];

  const processingPromises = files.map(async (file) => {
    const ext = '.png'; // or '.jpg' if you prefer JPEG
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    const filepath = path.join(tmpDir, filename);
   
    try {
      await sharp(file.buffer)
        .png() // or .jpeg() for JPEG
        .toFile(filepath);
     
      convertedFiles.push({
        filename: filename,
        originalname: file.originalname
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  });

  await Promise.all(processingPromises); // Wait for all processing to complete
  res.json({ files: convertedFiles });
});

app.get('/images', async (req, res) => {
  try {
    const files = await fs.readdir(tmpDir);
    // Filter for only .png or .jpg files
    const imageFiles = files.filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase()));
    res.json({ images: imageFiles });
  } catch (err) {
    console.error('Error reading uploads directory:', err);
    res.status(500).json({ error: 'Unable to scan directory' });
  }
});

// Serve images from the tmp directory
app.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(tmpDir, filename);
  res.sendFile(filepath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});