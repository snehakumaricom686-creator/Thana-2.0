import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import caseRoutes from './routes/cases.js';
import evidenceRoutes from './routes/evidence.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://thanatwopointo.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    if(!process.env.MONGO_URI) {
       console.log('MONGO_URI is not defined. Running in mock mode.');
       return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected to Thana 2.0 Database');
  } catch (error) {
    console.error('MongoDB Connection Error: Please check your network and Atlas IP Allowlist. Running without local DB.');
  }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Thana 2.0 API Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
