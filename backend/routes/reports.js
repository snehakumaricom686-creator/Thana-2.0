import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Simple in-memory store if DB is offline
const inMemoryReports = [];

const reportSchema = new mongoose.Schema({
  evidenceId: String,
  caseId: mongoose.Schema.Types.Mixed,
  reportText: String,
  forensicOfficerName: String,
  forensicOfficerId: String,
}, { timestamps: true });

let Report;
try {
  Report = mongoose.model('Report');
} catch {
  Report = mongoose.model('Report', reportSchema);
}

// GET all reports
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(inMemoryReports);
    }
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create forensic report
router.post('/', async (req, res) => {
  const { evidenceId, caseId, reportText, forensicOfficerName, forensicOfficerId } = req.body;
  if (!reportText || !evidenceId) return res.status(400).json({ error: 'Missing required fields' });

  try {
    if (mongoose.connection.readyState !== 1) {
      const newReport = { _id: Date.now().toString(), evidenceId, caseId, reportText, forensicOfficerName, forensicOfficerId, createdAt: new Date() };
      inMemoryReports.push(newReport);
      return res.status(201).json(newReport);
    }
    const report = new Report({ evidenceId, caseId, reportText, forensicOfficerName, forensicOfficerId });
    await report.save();
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
