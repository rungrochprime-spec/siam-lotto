import { User, LottoLimit, PayoutMultiplier, Purchase, Transaction, DrawResult } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin_siam',
    phone: '0812345678',
    balance: 145200,
    role: 'admin',
    registeredAt: '2026-05-01T12:00:00Z',
    status: 'active'
  },
  {
    id: 'user-1',
    username: 'สมชาย รักดี',
    phone: '0898765432',
    balance: 5400,
    role: 'customer',
    registeredAt: '2026-05-15T08:30:00Z',
    status: 'active'
  },
  {
    id: 'user-2',
    username: 'นารี ยิ้มแย้ม',
    phone: '0861112222',
    balance: 1250,
    role: 'customer',
    registeredAt: '2026-05-20T14:15:00Z',
    status: 'active'
  },
  {
    id: 'user-3',
    username: 'เกียรติศักดิ์ มั่งคั่ง',
    phone: '0855556666',
    balance: 15300,
    role: 'customer',
    registeredAt: '2026-06-01T10:00:00Z',
    status: 'active'
  },
  {
    id: 'user-4',
    username: 'วิไล แสนดี',
    phone: '0849999999',
    balance: 320,
    role: 'customer',
    registeredAt: '2026-06-05T16:45:00Z',
    status: 'active'
  }
];

export const INITIAL_PAYOUTS: PayoutMultiplier[] = [
  { type: '3up', multiplier: 900, label: '3 ตัวบน' },
  { type: '3tod', multiplier: 150, label: '3 ตัวโต๊ด' },
  { type: '2up', multiplier: 95, label: '2 ตัวบน' },
  { type: '2down', multiplier: 95, label: '2 ตัวล่าง' }
];

export const INITIAL_LIMITS: LottoLimit[] = [
  { number: '999', type: '3up', maxLimit: 5000, currentAmount: 4200 },
  { number: '123', type: '3up', maxLimit: 10000, currentAmount: 8500 },
  { number: '65', type: '2down', maxLimit: 15000, currentAmount: 12000 },
  { number: '07', type: '2up', maxLimit: 8000, currentAmount: 7800 },
  { number: '78', type: '2down', maxLimit: 12000, currentAmount: 3400 }
];

export const INITIAL_PURCHASES: Purchase[] = [
  // Historical Period 1 (1 June 2026) -> Result: 3Up="924", 3Tod Perms, 2Up="24", 2Down="65"
  {
    id: 'p-1',
    userId: 'user-1',
    username: 'สมชาย รักดี',
    ticketNumber: '924',
    type: '3up',
    amount: 100,
    payoutRate: 900,
    status: 'won',
    purchaseDate: '2026-06-01T09:30:00Z',
    wonAmount: 90000
  },
  {
    id: 'p-2',
    userId: 'user-2',
    username: 'นารี ยิ้มแย้ม',
    ticketNumber: '123',
    type: '3up',
    amount: 200,
    payoutRate: 900,
    status: 'lost',
    purchaseDate: '2026-06-01T11:00:00Z',
    wonAmount: 0
  },
  {
    id: 'p-3',
    userId: 'user-3',
    username: 'เกียรติศักดิ์ มั่งคั่ง',
    ticketNumber: '65',
    type: '2down',
    amount: 500,
    payoutRate: 95,
    status: 'won',
    purchaseDate: '2026-06-01T15:00:00Z',
    wonAmount: 47500
  },
  // Active Period (Pending draw on 16 June 2026)
  {
    id: 'p-4',
    userId: 'user-1',
    username: 'สมชาย รักดี',
    ticketNumber: '999',
    type: '3up',
    amount: 200,
    payoutRate: 900,
    status: 'pending',
    purchaseDate: '2026-06-11T04:20:00Z'
  },
  {
    id: 'p-5',
    userId: 'user-2',
    username: 'นารี ยิ้มแย้ม',
    ticketNumber: '123',
    type: '3up',
    amount: 150,
    payoutRate: 900,
    status: 'pending',
    purchaseDate: '2026-06-11T05:12:00Z'
  },
  {
    id: 'p-6',
    userId: 'user-3',
    username: 'เกียรติศักดิ์ มั่งคั่ง',
    ticketNumber: '07',
    type: '2up',
    amount: 1000,
    payoutRate: 95,
    status: 'pending',
    purchaseDate: '2026-06-11T06:40:00Z'
  },
  {
    id: 'p-7',
    userId: 'user-4',
    username: 'วิไล แสนดี',
    ticketNumber: '65',
    type: '2down',
    amount: 50,
    payoutRate: 95,
    status: 'pending',
    purchaseDate: '2026-06-11T07:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-3',
    username: 'เกียรติศักดิ์ มั่งคั่ง',
    type: 'deposit',
    amount: 50000,
    status: 'completed',
    timestamp: '2026-06-01T08:00:00Z',
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    bankAccount: '123-x-xxxx8-9'
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    username: 'สมชาย รักดี',
    type: 'withdraw',
    amount: 80000,
    status: 'completed',
    timestamp: '2026-06-02T10:15:00Z',
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccount: '987-x-xxxx1-2'
  },
  {
    id: 'tx-3',
    userId: 'user-2',
    username: 'นารี ยิ้มแย้ม',
    type: 'deposit',
    amount: 1500,
    status: 'completed',
    timestamp: '2025-06-10T09:00:00Z',
    bankName: 'ธนาคารกรุงเทพ (BBL)',
    bankAccount: '456-x-xxxx4-3'
  },
  {
    id: 'tx-4',
    userId: 'user-4',
    username: 'วิไล แสนดี',
    type: 'deposit',
    amount: 500,
    status: 'pending',
    timestamp: '2026-06-11T06:05:00Z',
    bankName: 'ธนาคารกรุงไทย (KTB)',
    bankAccount: '002-x-xxxx5-5'
  },
  {
    id: 'tx-5',
    userId: 'user-3',
    username: 'เกียรติศักดิ์ มั่งคั่ง',
    type: 'withdraw',
    amount: 10000,
    status: 'pending',
    timestamp: '2026-06-11T06:55:00Z',
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    bankAccount: '123-x-xxxx8-9'
  }
];

export const INITIAL_DRAWS: DrawResult[] = [
  {
    id: 'draw-1',
    drawDate: '2026-06-01',
    result3Up: '924',
    result3Tod: ['924', '942', '294', '249', '492', '429'],
    result2Up: '24',
    result2Down: '65',
    status: 'drawn'
  },
  {
    id: 'draw-2',
    drawDate: '2026-05-16',
    result3Up: '519',
    result3Tod: ['519', '591', '159', '195', '951', '915'],
    result2Up: '19',
    result2Down: '45',
    status: 'drawn'
  },
  {
    id: 'draw-active',
    drawDate: '2026-06-16',
    result3Up: '',
    result3Tod: [],
    result2Up: '',
    result2Down: '',
    status: 'pending'
  }
];
