const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { severity, description, longitude, latitude } = req.body;

    if (!severity || !longitude || !latitude) {
      return res.status(400).json({ message: 'Severity and location are required' });
    }

    const report = await Report.create({
      severity,
      description,
      photoUrl: req.file ? req.file.path : '',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'yes', 'no', or 'notSure'

    if (!['yes', 'no', 'notSure'].includes(vote)) {
      return res.status(400).json({ message: 'Vote must be yes, no, or notSure' });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.confirmations[vote] += 1;

    if (report.confirmations.yes >= 3 && report.status === 'Unverified') {
      report.status = 'Verified';
    }

    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getReports, verifyReport };