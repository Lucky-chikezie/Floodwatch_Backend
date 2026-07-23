const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    waterLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['Unverified', 'Verified', 'Resolved'],
      default: 'Unverified',
    },
    confirmations: {
      yes: { type: Number, default: 0 },
      no: { type: Number, default: 0 },
      notSure: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);