const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const createComment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const comment = await Comment.create({
      report: reportId,
      author: req.user._id,
      text,
    });

    if (report.creator && report.creator.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: report.creator,
        type: 'comment',
        message: `${req.user.name} commented on your report`,
        report: reportId,
        comment: comment._id,
      });
    }

    const populatedComment = await comment.populate('author', 'name');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { reportId } = req.params;

    const comments = await Comment.find({ report: reportId })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComment, getComments };