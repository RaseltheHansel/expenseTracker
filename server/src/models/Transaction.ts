import mongoose, { Schema } from "mongoose";
import type { ITransaction } from "../types";

const transactionSchema = new Schema<ITransaction>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        type: {
            type: String,
            enum: ['income', 'expense'],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        category: {
            type: String,
            enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Bills', 'Salary', 'Freelance', 'Investment', 'Other'],
            required: true,
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },

        date: {
            type: Date,
            default: Date.now,
        },
    },
    {timestamps: true}
);

export default mongoose.model<ITransaction>('ITransaction', transactionSchema)