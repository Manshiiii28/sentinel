const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    algorithm: { type: String, enum: ['token_bucket', 'sliding_window'], default: 'token_bucket' },
    rateLimit: { type: Number, default: 100 },
    windowSeconds: { type: Number, default: 60 },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);