import type { Response } from 'express';
import Transaction from '../models/Transaction';
import type { AuthRequest, TransactionType, Category } from '../types';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────
// PART A — Get transactions with optional filters
// ?type=expense, ?category=food, ?month=2025-02
// ─────────────────────────────────────────────
export const getTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, category, month } = req.query as {
            type?: string;
            category?: string;
            month?: string;
        };

        // Start with base filter — only this user's transactions
        const filter: Record<string, unknown> = { user: req.userId };

        // Add type filter only if provided
        if (type) filter.type = type as TransactionType;

        // Add category filter only if provided
        if (category) filter.category = category as Category;

        // Add date range filter only if month is provided (e.g. '2025-02')
        if (month) {
            const startDate = new Date(month + '-01');        // first day of month
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);         // first day of NEXT month
            filter.date = { $gte: startDate, $lt: endDate };  // between start and end
        }

        const transaction = await Transaction.find(filter).sort({ date: -1 });
        res.json(transaction);

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PART B — Create a new transaction
// POST /api/transactions
// ─────────────────────────────────────────────
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, amount, category, description, date } = req.body as {
            type: TransactionType;
            amount: number;
            category: Category;
            description?: string;
            date?: string;
        };

        // Validate required fields
        if (!type || !amount || !category) {
            res.status(400).json({ message: 'type, amount and category are required.' });
            return;
        }

        // Amount must be positive
        if (amount <= 0) {
            res.status(400).json({ message: 'Amount must be greater than 0.' });
            return;
        }

        const transaction = new Transaction({
            user:        req.userId,
            type,
            amount,
            category,
            description: description ?? '',          // default to empty string
            date:        date ? new Date(date) : new Date(), // default to today
        });

        await transaction.save();
        res.status(201).json({ transaction });

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PART B — Delete a transaction by ID
// DELETE /api/transactions/:id
// ─────────────────────────────────────────────
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Find and delete — only if it belongs to this user
        const transaction = await Transaction.findOneAndDelete({
            _id:  req.params.id,
            user: req.userId,
        });

        if (!transaction) {
            res.status(400).json({ message: 'Transaction not found.' });
            return;
        }

        res.json({ message: 'Transaction deleted successfully.' });

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PART C — Get summary
// Returns: totalIncome, totalExpense, balance, transactionCount
// GET /api/transactions/summary
// ─────────────────────────────────────────────
export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await Transaction.aggregate([

            // Stage 1: $match — filter to only this user's transactions
            // Same as Transaction.find({ user: req.userId })
            {
                $match: { user: new mongoose.Types.ObjectId(req.userId) }
            },

            // Stage 2: $group — group ALL transactions into ONE result and calculate totals
            // _id: null means don't group by any field, just combine everything
            {
                $group: {
                    _id: null,

                    // Add amount if type === 'income', otherwise add 0
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                        }
                    },

                    // Add amount if type === 'expense', otherwise add 0
                    totalExpense: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                        }
                    },

                    // Count total number of transactions
                    transactionCount: { $sum: 1 }
                }
            },

            // Stage 3: $project — shape the output and add calculated balance field
            {
                $project: {
                    _id:              0,   // hide the _id field
                    totalIncome:      1,   // include totalIncome
                    totalExpense:     1,   // include totalExpense
                    transactionCount: 1,   // include count
                    balance: { $subtract: ['$totalIncome', '$totalExpense'] } // income - expense
                }
            }
        ]);

        // If no transactions exist yet, return zeros
        if (result.length === 0) {
            res.json({ totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 });
            return;
        }

        res.json(result[0]);

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PART D — Get monthly summary
// Returns array of { month, totalIncome, totalExpense, balance, transactionCount }
// GET /api/transactions/monthly
// ─────────────────────────────────────────────
export const getMonthlySummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await Transaction.aggregate([

            // Stage 1: filter to this user only
            {
                $match: { user: new mongoose.Types.ObjectId(req.userId) }
            },

            // Stage 2: group by month (e.g. '2025-02')
            {
                $group: {
                    // Convert date to 'YYYY-MM' string and group by it
                    _id: { $dateToString: { format: '%Y-%m', date: '$date' } },

                    // Sum income amounts for this month
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                    },

                    // Sum expense amounts for this month
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                    },

                    // Count transactions for this month
                    transactionCount: { $sum: 1 }
                }
            },

            // Stage 3: shape the output and add balance
            {
                $project: {
                    _id:              0,   // hide raw _id
                    month:            '$_id', // rename _id to month
                    totalIncome:      1,
                    totalExpense:     1,
                    transactionCount: 1,
                    balance: { $subtract: ['$totalIncome', '$totalExpense'] }
                }
            },

            // Stage 4: sort by month descending (newest first)
            { $sort: { month: -1 } }
        ]);

        res.json(result);

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// PART E — Get category breakdown (expenses only)
// Returns array of { category, total, count } sorted by total descending
// GET /api/transactions/categories
// ─────────────────────────────────────────────
export const getCategoryBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await Transaction.aggregate([

            // Stage 1: filter to this user's expenses only
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.userId),
                    type: 'expense'
                }
            },

            // Stage 2: group by category and sum totals
            {
                $group: {
                    _id:   '$category',   // group by category name
                    total: { $sum: '$amount' }, // sum of all amounts in this category
                    count: { $sum: 1 }          // number of transactions in this category
                }
            },

            // Stage 3: shape the output
            {
                $project: {
                    _id:      0,
                    category: '$_id', // rename _id to category
                    total:    1,
                    count:    1
                }
            },

            // Stage 4: sort by total descending (biggest expense category first)
            { $sort: { total: -1 } }
        ]);

        res.json(result);

    } catch (error: unknown) {
        if (error instanceof Error) res.status(500).json({ message: error.message });
    }
};