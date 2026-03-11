import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  evidenceType: {
    type: String,
    enum: ['photo', 'cctv', 'audio', 'document', 'forensic'],
    required: true
  },
  description: {
    type: String,
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
  },
  fileHash: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Immutable seal metadata
  uploadTimestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  // ── GPS Location at time of evidence upload (immutable) ───────────────────
  location: {
    lat:      { type: Number, immutable: true },
    lng:      { type: Number, immutable: true },
    address:  { type: String, immutable: true },
    accuracy: { type: Number, immutable: true },
    capturedAt: { type: Date, immutable: true }
  },
  // Append-only chain of custody log
  actionLogs: [{
    action:    { type: String,  required: true },
    performedBy: { type: String },
    officerId: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  // Disable the ability to run updateOne/findByIdAndUpdate on this model
  optimisticConcurrency: true
});

// ─── IMMUTABILITY GUARD (Mongoose middleware) ──────────────────────────────
// Block any attempt to update an evidence document at the database level
const BLOCKED = 'IMMUTABLE EVIDENCE: This record is permanently sealed and cannot be modified after upload. Add a new supplementary record instead.';

evidenceSchema.pre('findOneAndUpdate', function(next) {
  return next(new Error(BLOCKED));
});

evidenceSchema.pre('updateOne', function(next) {
  return next(new Error(BLOCKED));
});

evidenceSchema.pre('updateMany', function(next) {
  return next(new Error(BLOCKED));
});

evidenceSchema.pre('findOneAndDelete', function(next) {
  return next(new Error(BLOCKED));
});

evidenceSchema.pre('deleteOne', function(next) {
  return next(new Error(BLOCKED));
});

evidenceSchema.pre('deleteMany', function(next) {
  return next(new Error(BLOCKED));
});

// Allow ONLY appending to actionLogs via instance method
evidenceSchema.methods.appendLog = async function(action, performedBy, officerId, ipAddress) {
  this.actionLogs.push({ action, performedBy, officerId, ipAddress, timestamp: new Date() });
  // Directly push to the array using $push to avoid triggering pre-update hooks
  return mongoose.model('Evidence').collection.updateOne(
    { _id: this._id },
    { $push: { actionLogs: { action, performedBy, officerId, ipAddress, timestamp: new Date() } } }
  );
};

export default mongoose.model('Evidence', evidenceSchema);
