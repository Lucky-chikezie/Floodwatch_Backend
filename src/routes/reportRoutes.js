const express = require('express');
const router = express.Router();
const { createReport, getReports, verifyReport, searchReports } = require('../controllers/reportController');
const upload = require('../middleware/upload');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('photo'), createReport);
router.get('/', getReports);
router.get('/search', searchReports);
router.patch('/:id/verify', protect, verifyReport);

module.exports = router;