import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendNotificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Fallback Memory Database when MongoDB is paused/disconnected
const mockUsers = [];

router.post('/login', async (req, res) => {
  const { officerId, password, stationCode } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      // Offline/Local Mode
      const user = mockUsers.find(u => u.officerId === officerId && u.stationCode.toUpperCase() === stationCode.toUpperCase());
      if (!user || user.password !== password) return res.status(401).json({ error: 'Authentication Failed (Check ID/Password)' });
      
      const token = jwt.sign({ userId: 'local_id', officerId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '12h' });
      
      await sendNotificationEmail(
        `Thana 2.0 Alert: Officer Login (Local DB)`, 
        `Alert! Officer ${user.name} (ID: ${user.officerId}) from Station ${user.stationCode} logged in at ${new Date().toLocaleString()}.`
      );
      return res.json({ token, user: { name: user.name, officerId, role: user.role } });
    }

    const user = await User.findOne({ officerId, stationCode: stationCode.toUpperCase() });
    if (!user) return res.status(401).json({ error: 'Authentication Failed (Officer not found)' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Authentication Failed' });

    const token = jwt.sign(
      { userId: user._id, officerId: user.officerId }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '12h' }
    );

    // Send a notification to Admin about login
    await sendNotificationEmail(
      `Thana 2.0 Alert: Officer Login`, 
      `Alert! Officer ${user.name} (ID: ${user.officerId}) from Station ${user.stationCode} has just logged into the Thana 2.0 system at ${new Date().toLocaleString()}.`
    );

    res.json({ token, user: { name: user.name, officerId, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin creation endpoint for testing
router.post('/register', async (req, res) => {
  const { officerId, password, name, stationCode, role } = req.body;
  const assignedRole = role || 'inspector';
  try {
    if (mongoose.connection.readyState !== 1) {
      // Offline/Local Mode
      const exists = mockUsers.find(u => u.officerId === officerId);
      if(exists) return res.status(400).json({ error: 'Officer ID exists already in local cache' });
      
      mockUsers.push({ officerId, password, name, stationCode: stationCode.toUpperCase(), role: assignedRole });
      
      await sendNotificationEmail(
        `Thana 2.0 Alert: New Officer Registration (Local DB)`, 
        `Notification! A new ID was created locally for Officer ${name} (ID: ${officerId}) assigned to Station ${stationCode}.`
      );
      return res.status(201).json({ message: 'Officer registered (Local Mode)' });
    }

    const exists = await User.findOne({ officerId });
    if(exists) return res.status(400).json({ error: 'Officer ID exists in Database' });

    const newUser = new User({ officerId, password, name, stationCode: stationCode.toUpperCase(), role: assignedRole });
    await newUser.save();

    // Send a notification to Admin about registration
    await sendNotificationEmail(
      `Thana 2.0 Alert: New Officer Registration`, 
      `Notification! A new ID has been created for Officer ${name} (ID: ${officerId}) assigned to Station ${stationCode} on the Thana 2.0 system.`
    );

    res.status(201).json({ message: 'Officer registered' });
  } catch(error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
