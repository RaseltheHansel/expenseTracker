import type { Request } from 'express';
import type { Document, Types} from 'mongoose';

export interface AuthRequest extends Request {
    userId?: string;
}

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;

}

export type TransactionType = 'income' | 'expenses';

export type Category = |'Food'|'Transport'|'Entertainment'|'Shopping'|'Health'|'Education'|'Bills'|'Salary'|'Freelance'|'Investment'|'Others';


export interface ITransaction extends Document  {
    user: Types.ObjectId;
    type: TransactionType;
    amount: number;
    category: Category;
    description: string;
    date: Date;
    

}

export interface MonthlySummary extends Document {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;

}