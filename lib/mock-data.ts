// Mock data for frontend-first development
// This will be replaced by Supabase calls in Step 10

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  monthly_limit: number;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  date: string;
  created_at: string;
}

export const mockUser: User = {
  id: 'mock-user-1',
  email: 'demo@example.com',
  created_at: '2026-10-01T00:00:00Z',
};

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    user_id: 'mock-user-1',
    name: 'Food',
    monthly_limit: 300,
    color: '#FF6B6B',
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    user_id: 'mock-user-1',
    name: 'Fun',
    monthly_limit: 100,
    color: '#4ECDC4',
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    user_id: 'mock-user-1',
    name: 'Transport',
    monthly_limit: 80,
    color: '#45B7D1',
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    user_id: 'mock-user-1',
    name: 'School',
    monthly_limit: 50,
    color: '#96CEB4',
    created_at: '2026-10-01T00:00:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    user_id: 'mock-user-1',
    category_id: null,
    type: 'income',
    amount: 50.0,
    note: 'Monthly allowance',
    date: '2026-10-01',
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'txn-2',
    user_id: 'mock-user-1',
    category_id: 'cat-1',
    type: 'expense',
    amount: 25.5,
    note: 'Lunch with friends',
    date: '2026-10-02',
    created_at: '2026-10-02T12:30:00Z',
  },
  {
    id: 'txn-3',
    user_id: 'mock-user-1',
    category_id: 'cat-2',
    type: 'expense',
    amount: 15.0,
    note: 'Movie ticket',
    date: '2026-10-03',
    created_at: '2026-10-03T19:00:00Z',
  },
  {
    id: 'txn-4',
    user_id: 'mock-user-1',
    category_id: 'cat-1',
    type: 'expense',
    amount: 12.75,
    note: 'Groceries',
    date: '2026-10-04',
    created_at: '2026-10-04T16:00:00Z',
  },
  {
    id: 'txn-5',
    user_id: 'mock-user-1',
    category_id: 'cat-3',
    type: 'expense',
    amount: 8.5,
    note: 'Bus pass',
    date: '2026-10-05',
    created_at: '2026-10-05T09:00:00Z',
  },
  {
    id: 'txn-6',
    user_id: 'mock-user-1',
    category_id: 'cat-4',
    type: 'expense',
    amount: 20.0,
    note: 'Notebook and pens',
    date: '2026-10-06',
    created_at: '2026-10-06T11:00:00Z',
  },
  {
    id: 'txn-7',
    user_id: 'mock-user-1',
    category_id: 'cat-1',
    type: 'expense',
    amount: 35.0,
    note: 'Pizza night',
    date: '2026-10-07',
    created_at: '2026-10-07T20:00:00Z',
  },
  {
    id: 'txn-8',
    user_id: 'mock-user-1',
    category_id: 'cat-2',
    type: 'expense',
    amount: 25.0,
    note: 'Video game',
    date: '2026-10-08',
    created_at: '2026-10-08T15:00:00Z',
  },
  {
    id: 'txn-9',
    user_id: 'mock-user-1',
    category_id: null,
    type: 'income',
    amount: 20.0,
    note: 'Birthday gift',
    date: '2026-10-10',
    created_at: '2026-10-10T10:00:00Z',
  },
  {
    id: 'txn-10',
    user_id: 'mock-user-1',
    category_id: 'cat-3',
    type: 'expense',
    amount: 15.0,
    note: 'Gas money',
    date: '2026-10-12',
    created_at: '2026-10-12T14:00:00Z',
  },
];

// Simple event system to notify components of data changes
type DataChangeListener = () => void;
const listeners: DataChangeListener[] = [];

export function onDataChange(listener: DataChangeListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
}

export function notifyDataChange(): void {
  listeners.forEach((listener) => listener());
}
