const cron = require('node-cron');
const Report = require('../models/Report');

const runDecay = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const deleted = await Report.deleteMany({
      status: 'Unverified',
      createdAt: { $lt: oneHourAgo },
    });

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const resolved = await Report.updateMany(
      { status: 'Verified', updatedAt: { $lt: twelveHoursAgo } },
      { $set: { status: 'Resolved' } }
    );

    console.log(`Decay run: removed ${deleted.deletedCount} unverified, resolved ${resolved.modifiedCount} verified`);
  } catch (error) {
    console.error('Decay job failed:', error.message);
  }
};

const startDecayJob = () => {
  cron.schedule('0 * * * *', runDecay); // runs every hour
};

module.exports = startDecayJob;