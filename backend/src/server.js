// Updated server with auth routes and cookie handling
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import authRefreshRouter from './routes/authRefresh.js';

// Services
import CityHealthScoreService from './services/CityHealthScoreService.js';
import WhatIfSimulatorService from './services/WhatIfSimulatorService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth', authRefreshRouter);

// Basic Routes
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'UP', service: 'civicpulse-backend' });
});

app.get('/api/v1/city-health-score', async (req, res) => {
    try {
        const { zoneId } = req.query;
        const score = await CityHealthScoreService.calculateScore(zoneId);
        res.json({ score });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/v1/simulate-impact', async (req, res) => {
    try {
        const { complaintIds } = req.body;
        const impact = await WhatIfSimulatorService.simulateResolutionImpact(complaintIds);
        res.json(impact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database Connection
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civicpulse';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });
