const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    uploadDocumentController,
    getDocumentsBySessionController,
    getDocumentsBySessionAndOperationController
} = require('../../Controllers/sqlServer/documentController');
const { renderPvPdfController } = require('../../Controllers/sqlServer/pvPdfController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

router.post('/upload', upload.single('document'), uploadDocumentController);
router.get('/session/:sessionID', getDocumentsBySessionController);
router.get('/session/:sessionID/operation/:operationID', getDocumentsBySessionAndOperationController);
router.post('/render-pv', renderPvPdfController);

module.exports = router;
