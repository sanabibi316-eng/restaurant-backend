const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
const dirs = ['menu', 'categories', 'staff'];
dirs.forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer config - store in memory for sharp processing
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

// Process and save image
const processImage = (folder) => async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const filepath = path.join(uploadDir, folder, filename);

    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = `/uploads/${folder}/${filename}`;
    next();
  } catch (error) {
    next(error);
  }
};

// Delete old image
const deleteImage = (imagePath) => {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { upload, processImage, deleteImage };