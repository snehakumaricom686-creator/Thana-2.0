import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  firNumber: {
    type: String,
    required: true,
    unique: true,
    immutable: true  // FIR numbers can never be changed after registration
  },
  title: {
    type: String,
    required: true,
    immutable: true  // Case title is sealed at registration
  },
  description: {
    type: String,
    immutable: true  // Original description is permanently locked
  },
  stationCode: {
    type: String,
    required: true,
    immutable: true  // Station code cannot be moved after registration
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // NOT immutable — can be reassigned by admin
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Evidence Uploaded', 'Active Search', 'Forensic Analysis', 'Forensic Report', 'Court Trial', 'Closed'],
    default: 'Open'
    // Status CAN be updated by admin — this is the only mutable field
  },
  // ── GPS Location at time of FIR registration (immutable) ─────────────────
  location: {
    lat:      { type: Number, immutable: true },
    lng:      { type: Number, immutable: true },
    address:  { type: String, immutable: true },   // reverse-geocoded human-readable address
    accuracy: { type: Number, immutable: true },   // accuracy in meters
    capturedAt: { type: Date, immutable: true }    // exact GPS capture timestamp
  },
  // ── Official registration timestamp (immutable) ────────────────────────────
  registeredAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  // Append-only activity log
  activityLog: [{
    action:      String,
    performedBy: String,
    officerId:   String,
    timestamp:   { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Case', caseSchema);
