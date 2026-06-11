export type LottoType = '3up' | '3tod' | '2up' | '2down';

export interface User {
  id: string;
  username: string;
  phone: string;
  balance: number;
  role: 'customer' | 'admin';
  registeredAt: string;
  status: 'active' | 'suspended';
}

export interface LottoLimit {
  number: string;
  type: LottoType;
  maxLimit: number; // Maximum total money accepted for this number
  currentAmount: number; // Current total money bet on this number
}

export interface PayoutMultiplier {
  type: LottoType;
  multiplier: number; // e.g. 3up = 900, 2up = 95
  label: string;
}

export interface Purchase {
  id: string;
  userId: string;
  username: string;
  ticketNumber: string;
  type: LottoType;
  amount: number; // Amount bet in Baht
  payoutRate: number; // Rate at purchase time
  status: 'pending' | 'won' | 'lost';
  purchaseDate: string;
  wonAmount?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: string;
  bankName?: string;
  bankAccount?: string;
}

export interface DrawResult {
  id: string;
  drawDate: string;
  result3Up: string; // 3 digits, e.g. "924"
  result3Tod: string[]; // Premutations of 3up
  result2Up: string; // Last 2 digits of top, e.g. "24"
  result2Down: string; // 2 digits down, e.g. "65"
  status: 'drawn' | 'pending';
}
