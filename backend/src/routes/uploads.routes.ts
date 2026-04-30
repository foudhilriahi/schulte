import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/authenticate';
import { rateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';

const router = Router();
router.use(rateLimiter(60, 1 * 60 * 1000));

// GET /api/uploads/:filename - Authenticated file serving
router.get('/:filename', authenticate, (req, res) => {
  try {
    const filename = req.params.filename as string;
    
    // Validate filename to prevent path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    
    // Log access for security monitoring
    logger.info(`File access: ${filename} by user ${req.user?.userId} (${req.user?.role})`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    logger.error('File serving error:', error);
    res.status(500).json({ error: 'Echec du service du fichier' });
  }
});

export default router;
