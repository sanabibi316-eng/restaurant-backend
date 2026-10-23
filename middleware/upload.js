const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Lazy load sharp so missing native bindings on serverless do not crash the app
let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('⚠️ Sharp native binary could not be loaded in this environment:', e.message);
}

// Multer config - store in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Process and save image (safely handling read-only serverless environments)
const processImage = (folder) => async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    
    // In serverless (e.g. Vercel), the root file system is read-only.
    // Use /tmp or data URI if persistent disk is unavailable.
    const isServerless = !!process.env.VERCEL;
    const baseDir = isServerless ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
    const folderPath = path.join(baseDir, folder);

    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    } catch {
      // Ignore directory create errors in read-only runtimes
    }

    const filepath = path.join(folderPath, filename);

    if (sharp) {
      await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath)
        .catch(() => {});
    }

    req.file.filename = filename;
    req.file.path = `/uploads/${folder}/${filename}`;
    next();
  } catch (error) {
    // Don't fail the request if image processing fails on serverless
    console.error('Image processing error:', error.message);
    next();
  }
};

// Delete old image
const deleteImage = (imagePath) => {
  if (!imagePath) return;
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
    // Ignore delete failures on serverless
  }
};

module.exports = { upload, processImage, deleteImage };
