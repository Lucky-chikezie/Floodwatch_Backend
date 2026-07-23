const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { waterLevel, description, longitude, latitude } = req.body;

    if (!waterLevel || !longitude || !latitude) {
      return res.status(400).json({ message: 'Water level and location are required' });
    }

    const report = await Report.create({
      waterLevel,
      description,
      photoUrl: req.file ? req.file.path : '',
      creator: req.user._id,
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

const confirmReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;

    if (!['yes', 'no', 'notSure'].includes(vote)) {
      return res.status(400).json({ message: 'Vote must be yes, no, or notSure' });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.creator && report.creator.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot verify your own report' });
    }

    const alreadyVoted = report.voters.some(
      (voterId) => voterId.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted on this report' });
    }

    report.confirmations[vote] += 1;
    report.voters.push(req.user._id);

    if (report.confirmations.yes >= 3 && report.status === 'Unverified') {
      report.status = 'Verified';
    }

    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchReports = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const maxDistance = radius ? Number(radius) : 5000;

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getReports, confirmReport, searchReports };