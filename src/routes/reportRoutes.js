const express = require('express');
const router = express.Router();
const { createReport, getReports, confirmReport, searchReports } = require('../controllers/reportController');
const upload = require('../middleware/upload');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('photo'), createReport);
router.get('/', getReports);
router.get('/search', searchReports);
router.patch('/:id/confirm', protect, confirmReport);

module.exports = router;