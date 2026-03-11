import express from 'express';
import Case from '../models/Case.js';

const router = express.Router();

// Get all cases
router.get('/', async (req, res) => {
  try {
    const cases = await Case.find().populate('assignedOfficer', 'name officerId');
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new case
router.post('/', async (req, res) => {
  try {
    const newCase = new Case(req.body);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(400).json({ error: 'Creation failed' });
  }
});

// Get single case
router.get('/:id', async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('assignedOfficer', 'name');
    if (!caseData) return res.status(404).json({ error: 'Not found' });
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── STATUS-ONLY UPDATE (Admin) ──────────────────────────────────────────────
// Restricted: only the 'status' field may be changed. Core case data is immutable.
router.put('/:id', async (req, res) => {
  const IMMUTABLE_FIELDS = ['firNumber', 'title', 'description', 'stationCode', 'assignedOfficer', 'createdAt', '_id'];
  const attempted = Object.keys(req.body).filter(k => IMMUTABLE_FIELDS.includes(k));

  if (attempted.length > 0) {
    return res.status(403).json({
      error: 'IMMUTABLE FIELD MODIFICATION BLOCKED',
      message: `The following core case fields are permanently sealed and cannot be changed: ${attempted.join(', ')}. Only the case STATUS may be updated by an authorized officer.`,
      code: 'CASE_FIELD_IMMUTABLE'
    });
  }

  // Only allow status to be set
  const allowedUpdate = {};
  if (req.body.status) allowedUpdate.status = req.body.status;

  if (Object.keys(allowedUpdate).length === 0) {
    return res.status(400).json({ error: 'No valid update fields provided. Only "status" can be changed.' });
  }

  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $set: allowedUpdate,
        $push: { activityLog: {
          action:      `Case status updated to: ${allowedUpdate.status}`,
          performedBy: req.body.officerName || 'Admin',
          officerId:   req.body.officerId   || 'N/A',
          timestamp:   new Date()
        }}
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Case not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Update failed: ' + error.message });
  }
});

// ─── BLOCK ALL DIRECT DELETE (even admin) ────────────────────────────────────
// Case files cannot be deleted — they are permanent legal records.
// Admin can only mark them "Closed".
router.delete('/:id', (req, res) => {
  res.status(403).json({
    error: 'PERMANENT LEGAL RECORD',
    message: 'Case files are permanent legal records and cannot be deleted from the system. To close a case, update its status to "Closed" instead.',
    code: 'CASE_DELETION_BLOCKED'
  });
});

export default router;


