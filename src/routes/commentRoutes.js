const express = require('express');
const router = express.Router();
const { createComment, getComments } = require('../controllers/commentController');
const protect = require('../middleware/authMiddleware');

router.post('/:reportId', protect, createComment);
router.get('/:reportId', protect, getComments);

module.exports = router;