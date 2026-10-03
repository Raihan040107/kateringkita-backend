import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/auth', authRoutes);

export default app;