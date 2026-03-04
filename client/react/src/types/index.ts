export type TransactionType = 'income' | 'expense';

export type Category = |'Food'|'Transport'|'Entertainment'|'Shopping'|'Health'|'Education'|'Bills'|'Salary'|'Freelance'|'Investment'|'Others';

export interface Transaction {
    _id: string;
    type: TransactionType;
    amount: number;
    category: Category;
    description: string;
    date: string;
}

export interface Summary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

export interface monthlyData {
    month: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;

}

export interface categoryData {
    category: string;
    total: number;
    count: number;
}

export interface user {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: user;
}