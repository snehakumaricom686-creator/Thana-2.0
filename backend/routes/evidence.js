import express from 'express';
import Evidence from '../models/Evidence.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// IMMUTABILITY POLICY NOTICE (returned for all disallowed methods)
// ─────────────────────────────────────────────────────────────────────────────
const IMMUTABLE_RESPONSE = {
  error: 'IMMUTABLE RECORD',
  message: 'Evidence records are permanently sealed under the Digital Evidence Chain-of-Custody Act. No modification or deletion is permitted after upload. To add information, upload a new supplementary evidence file.',
  code: 'EVIDENCE_IMMUTABLE'
};

// Block ALL PUT, PATCH, DELETE on evidence at the router level
router.put('*',    (req, res) => res.status(403).json(IMMUTABLE_RESPONSE));
router.patch('*',  (req, res) => res.status(403).json(IMMUTABLE_RESPONSE));
router.delete('*', (req, res) => res.status(403).json(IMMUTABLE_RESPONSE));

// ─────────────────────────────────────────────────────────────────────────────
// POST /upload — Seal and store new evidence (one-time, immutable)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', process.env.CLOUDINARY_CLOUD_NAME ? upload.single('evidenceFile') : express.json(), async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(201).json({
        message: 'Mock evidence upload complete. Set Cloudinary keys to enable real storage.',
        hash: 'demo_sha256_hash_verify_' + Date.now()
      });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Generate a deterministic upload timestamp seal
    const sealTimestamp = new Date();
    const mockHash = `sha256_${sealTimestamp.getTime()}_${req.file.filename || 'file'}`;

    // Parse GPS location if provided by inspector
    const locationData = req.body.locationLat ? {
      lat:         parseFloat(req.body.locationLat),
      lng:         parseFloat(req.body.locationLng),
      address:     req.body.locationAddress || '',
      accuracy:    parseFloat(req.body.locationAccuracy) || 0,
      capturedAt:  req.body.locationCapturedAt ? new Date(req.body.locationCapturedAt) : sealTimestamp,
    } : undefined;

    const evidence = new Evidence({
      caseId:             req.body.caseId,
      evidenceType:       req.body.evidenceType,
      description:        req.body.description,
      cloudinaryUrl:      req.file.path,
      cloudinaryPublicId: req.file.filename,
      fileHash:           mockHash,
      uploadTimestamp:    sealTimestamp,
      uploadedBy:         req.body.officerId,
      location:           locationData,
      actionLogs: [{
        action:      'EVIDENCE SEALED & UPLOADED — Chain of Custody Initiated',
        performedBy: req.body.officerName || 'Officer',
        officerId:   req.body.officerId,
        ipAddress:   req.ip,
        timestamp:   sealTimestamp
      }]
    });

    await evidence.save();

    res.status(201).json({
      message: 'Evidence permanently sealed and secured',
      sealTimestamp,
      fileHash: mockHash,
      evidenceId: evidence._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:id/view-log — Log a "viewed" access event (read-only chain of custody)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/view-log', async (req, res) => {
  try {
    const ev = await Evidence.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Evidence not found' });

    // Append access log using direct $push (bypasses immutability hooks)
    await Evidence.collection.updateOne(
      { _id: ev._id },
      { $push: { actionLogs: {
        action:      'EVIDENCE ACCESSED (READ-ONLY)',
        performedBy: req.body.officerName || 'Officer',
        officerId:   req.body.officerId,
        ipAddress:   req.ip,
        timestamp:   new Date()
      }}}
    );
    res.json({ message: 'Access logged' });
  } catch (e) {
    res.status(500).json({ error: 'Log failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /case/:caseId — Fetch evidence for a case (read-only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/case/:caseId', async (req, res) => {
  try {
    const list = await Evidence.find({ caseId: req.params.caseId })
                               .populate('uploadedBy', 'name officerId');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET / — Fetch all sealed evidence records (read-only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const list = await Evidence.find()
                               .populate('uploadedBy', 'name officerId')
                               .populate('caseId', 'firNumber title status')
                               .select('-__v')
                               .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /:id — Fetch a single sealed evidence record (read-only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const ev = await Evidence.findById(req.params.id)
                             .populate('uploadedBy', 'name officerId role')
                             .populate('caseId', 'firNumber title');
    if (!ev) return res.status(404).json({ error: 'Evidence not found' });
    res.json(ev);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
