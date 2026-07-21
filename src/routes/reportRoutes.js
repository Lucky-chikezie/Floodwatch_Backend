const express = require('express');
const router = express.Router();
const { createReport, getReports, verifyReport, searchReports } = require('../controllers/reportController');
const upload = require('../middleware/upload');

router.post('/', upload.single('photo'), createReport);
router.get('/', getReports);
router.get('/search', searchReports);
router.patch('/:id/verify', verifyReport);

module.exports = router;