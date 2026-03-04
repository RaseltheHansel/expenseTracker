import express, { Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db';
import authRoutes from './routes/authRoutes'
import transactionRoutes from './routes/transactionRoutes';

const app: Application = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (_req, res) => res.send('Expense Tracker API is running!'));

const PORT = parseInt(process.env.PORT ?? '5000', 10);
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));