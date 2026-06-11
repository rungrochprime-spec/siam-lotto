import { useState, useEffect } from 'react';
import { User, LottoLimit, PayoutMultiplier, Purchase, Transaction, DrawResult, LottoType } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_PAYOUTS, 
  INITIAL_LIMITS, 
  INITIAL_PURCHASES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_DRAWS 
} from './initialData';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';
import { Shield, Users, UserCheck, HelpCircle, CheckCircle, Smartphone, Volume2, Award, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Master states
  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>('customer');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [payouts, setPayouts] = useState<PayoutMultiplier[]>([]);
  const [limits, setLimits] = useState<LottoLimit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);

  // Sound and notification settings
  const [alertNotification, setAlertNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Load from localstorage or initialize
  useEffect(() => {
    const cachedUsers = localStorage.getItem('siam_lotto_users');
    const cachedPayouts = localStorage.getItem('siam_lotto_payouts');
    const cachedLimits = localStorage.getItem('siam_lotto_limits');
    const cachedPurchases = localStorage.getItem('siam_lotto_purchases');
    const cachedTransactions = localStorage.getItem('siam_lotto_transactions');
    const cachedDraws = localStorage.getItem('siam_lotto_draws');

    if (cachedUsers) setUsers(JSON.parse(cachedUsers));
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('siam_lotto_users', JSON.stringify(INITIAL_USERS));
    }

    if (cachedPayouts) setPayouts(JSON.parse(cachedPayouts));
    else {
      setPayouts(INITIAL_PAYOUTS);
      localStorage.setItem('siam_lotto_payouts', JSON.stringify(INITIAL_PAYOUTS));
    }

    if (cachedLimits) setLimits(JSON.parse(cachedLimits));
    else {
      setLimits(INITIAL_LIMITS);
      localStorage.setItem('siam_lotto_limits', JSON.stringify(INITIAL_LIMITS));
    }

    if (cachedPurchases) setPurchases(JSON.parse(cachedPurchases));
    else {
      setPurchases(INITIAL_PURCHASES);
      localStorage.setItem('siam_lotto_purchases', JSON.stringify(INITIAL_PURCHASES));
    }

    if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions));
    else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('siam_lotto_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (cachedDraws) setDrawResults(JSON.parse(cachedDraws));
    else {
      setDrawResults(INITIAL_DRAWS);
      localStorage.setItem('siam_lotto_draws', JSON.stringify(INITIAL_DRAWS));
    }
  }, []);

  // Update current logged-in user details if users database updates
  useEffect(() => {
    if (currentUser) {
      const refreshedUser = users.find(u => u.id === currentUser.id);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
    }
  }, [users]);

  // Synchronizers
  const saveUsers = (uList: User[]) => {
    setUsers(uList);
    localStorage.setItem('siam_lotto_users', JSON.stringify(uList));
  };

  const savePayouts = (pList: PayoutMultiplier[]) => {
    setPayouts(pList);
    localStorage.setItem('siam_lotto_payouts', JSON.stringify(pList));
  };

  const saveLimits = (lList: LottoLimit[]) => {
    setLimits(lList);
    localStorage.setItem('siam_lotto_limits', JSON.stringify(lList));
  };

  const savePurchases = (purList: Purchase[]) => {
    setPurchases(purList);
    localStorage.setItem('siam_lotto_purchases', JSON.stringify(purList));
  };

  const saveTransactions = (txList: Transaction[]) => {
    setTransactions(txList);
    localStorage.setItem('siam_lotto_transactions', JSON.stringify(txList));
  };

  const saveDraws = (dList: DrawResult[]) => {
    setDrawResults(dList);
    localStorage.setItem('siam_lotto_draws', JSON.stringify(dList));
  };

  const triggerAlert = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setAlertNotification({ message, type });
    setTimeout(() => setAlertNotification(null), 5000);
  };

  // 1. Client-side Action: สมัครสมาชิก (Register)
  const handleRegister = (username: string, phone: string) => {
    const newUser: User = {
      id: 'customer-' + Math.random().toString(36).substring(7),
      username,
      phone,
      balance: 500, // Welcome Free Credit for immediate testing!
      role: 'customer',
      registeredAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    triggerAlert(`สมัครสมาชิกสำเร็จ! สิทธิ์ผู้ใช้ ${username} ได้รับเครดิตฟรี 500 บาท สำหรับทดลอง`, 'success');
    setCurrentUser(newUser);
  };

  const handleLogin = (userId: string) => {
    const userToLog = users.find(u => u.id === userId);
    if (userToLog) {
      if (userToLog.status === 'suspended') {
        triggerAlert(`บัญชีนี้ถูกระงับติดต่อเจ้าหน้าที่แอดมินหลังบ้าน`, 'warning');
        return;
      }
      setCurrentUser(userToLog);
      triggerAlert(`เข้าสู่ระบบในฐานะ ${userToLog.username} สำเร็จ`, 'success');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    triggerAlert(`ลงชื่อออกสำเร็จ`, 'info');
  };

  // 2. Client-side Action: เติมเงิน (Deposit)
  const handleDeposit = (amount: number, bankName: string, bankAccount: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: 'dep-' + Math.random().toString(36).substring(5),
      userId: currentUser.id,
      username: currentUser.username,
      type: 'deposit',
      amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      bankName,
      bankAccount
    };

    const updatedTx = [newTx, ...transactions];
    saveTransactions(updatedTx);
    triggerAlert(`แจ้งฝากเงิน ฿${amount.toLocaleString()} สำเร็จ! รอการตรวจความถูกต้องทางบัญชีแอดมิน`, 'success');
  };

  // 3. Client-side Action: ถอนเงิน (Withdraw)
  const handleWithdraw = (amount: number, bankName: string, bankAccount: string) => {
    if (!currentUser) return;

    // Deduct from balance immediately to hold
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balance: u.balance - amount };
      }
      return u;
    });
    saveUsers(updatedUsers);

    const newTx: Transaction = {
      id: 'wit-' + Math.random().toString(36).substring(5),
      userId: currentUser.id,
      username: currentUser.username,
      type: 'withdraw',
      amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      bankName,
      bankAccount
    };

    const updatedTx = [newTx, ...transactions];
    saveTransactions(updatedTx);
    triggerAlert(`แจ้งขอถอนเงิน ฿${amount.toLocaleString()} สำเร็จ! ระบบได้ทำการล็อคยอดเงินไว้จนกว่าจะส่งอนุมัติ`, 'info');
  };

  // 4. Client-side Action: ซื้อเลข (Buy numbers)
  const handleBuyTickets = (cart: { number: string; type: LottoType; amount: number }[]): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการซื้อ' };
    }

    const totalCost = cart.reduce((sum, item) => sum + item.amount, 0);
    if (totalCost > currentUser.balance) {
      return { success: false, message: 'ยอดเงินเครดิตคงเหลือไม่พอสนับสนุนบิลนี้' };
    }

    // Advanced: Check and increment on limitations
    const tempLimits = [...limits];
    const newPurchases: Purchase[] = [];
    let isViolated = false;
    let limitMessage = '';

    for (const item of cart) {
      const limitIndex = tempLimits.findIndex(l => l.number === item.number && l.type === item.type);
      if (limitIndex !== -1) {
        const remaining = tempLimits[limitIndex].maxLimit - tempLimits[limitIndex].currentAmount;
        if (remaining <= 0) {
          isViolated = true;
          limitMessage = `เลข ${item.number} (${item.type}) เต็มโควต้ารับแทงแล้ว`;
          break;
        }
        if (item.amount > remaining) {
          isViolated = true;
          limitMessage = `เลข ${item.number} (${item.type}) รับเพิ่มได้อีกไม่เกิน ฿${remaining.toLocaleString()}`;
          break;
        }
        tempLimits[limitIndex].currentAmount += item.amount;
      } else {
        // If there's no pre-existing limit model but there is a system-wide safety threshold (e.g. max 15000)
        const defaultMax = 15000;
        const currentTotalSold = purchases
          .filter(p => p.status === 'pending' && p.ticketNumber === item.number && p.type === item.type)
          .reduce((sum, p) => sum + p.amount, 0);

        if (currentTotalSold + item.amount > defaultMax) {
          isViolated = true;
          limitMessage = `เลข ${item.number} เกินเพดานอั้นพื้นฐานระบบ ฿${defaultMax.toLocaleString()} (ปัจจุบันสะสมแล้ว ฿${currentTotalSold.toLocaleString()})`;
          break;
        }

        // Add dynamically as a limit to track risk
        tempLimits.push({
          number: item.number,
          type: item.type,
          maxLimit: defaultMax,
          currentAmount: currentTotalSold + item.amount
        });
      }

      const mult = payouts.find(p => p.type === item.type)?.multiplier || 1;
      newPurchases.push({
        id: 'bil-' + Math.random().toString(36).substring(7),
        userId: currentUser.id,
        username: currentUser.username,
        ticketNumber: item.number,
        type: item.type,
        amount: item.amount,
        payoutRate: mult,
        status: 'pending',
        purchaseDate: new Date().toISOString()
      });
    }

    if (isViolated) {
      return { success: false, message: limitMessage };
    }

    // Apply all
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balance: u.balance - totalCost };
      }
      return u;
    });

    saveUsers(updatedUsers);
    saveLimits(tempLimits);
    savePurchases([...newPurchases, ...purchases]);
    triggerAlert(`ชำระบิลสลากล็อตเตอรี่ ฿${totalCost.toLocaleString()} สำเร็จ! ปรับสมดุลเครดิตทันที`, 'success');

    return { success: true, message: 'สั่งซื้อสำเร็จ! รอผลการออกรางวัลประจำงวด' };
  };

  // 5. Admin-side Actions
  // 5.1 จัดการยอดรับเลขอั้น
  const handleAddLimit = (number: string, type: LottoType, maxLimit: number) => {
    // Check if duplicate
    const cleanNumber = number.trim();
    const existingIndex = limits.findIndex(l => l.number === cleanNumber && l.type === type);
    
    if (existingIndex !== -1) {
      const updatedLimits = [...limits];
      updatedLimits[existingIndex].maxLimit = maxLimit;
      saveLimits(updatedLimits);
    } else {
      const newLimit: LottoLimit = {
        number: cleanNumber,
        type,
        maxLimit,
        currentAmount: 0 // Will accumulate when orders fly in
      };
      saveLimits([...limits, newLimit]);
    }
    triggerAlert(`บันทึกโควต้าเลขอั้น หมายเลข ${cleanNumber} (${type}) สำเร็จ`, 'success');
  };

  const handleRemoveLimit = (number: string, type: LottoType) => {
    const updatedLimits = limits.filter(l => !(l.number === number && l.type === type));
    saveLimits(updatedLimits);
    triggerAlert(`ยกเลิกข้อจำกัดอั้น เลข ${number} เรียบร้อยแล้ว`, 'info');
  };

  // 5.2 ตั้งราคาจ่าย (Set custom payouts)
  const handleUpdatePayout = (type: LottoType, multiplier: number) => {
    const updatedPayouts = payouts.map(p => {
      if (p.type === type) {
        return { ...p, multiplier };
      }
      return p;
    });
    savePayouts(updatedPayouts);
  };

  // 5.3 อนุมัติสลิปโอนและถอนเงิน
  const handleApproveTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    // Approve logic
    const updatedTx = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'completed' as const };
      return t;
    });

    if (tx.type === 'deposit') {
      // Add balance to user
      const updatedUsers = users.map(u => {
        if (u.id === tx.userId) {
          return { ...u, balance: u.balance + tx.amount };
        }
        return u;
      });
      saveUsers(updatedUsers);
      triggerAlert(`อนุมัติเติมสลิปให้ผู้ใช้ ${tx.username} ฿${tx.amount.toLocaleString()} เรียบร้อย`, 'success');
    } else {
      // Withdrawal: balance already subtracted, just change state
      triggerAlert(`อนุมัติถอนเงินสำเร็จและโอนชำระปลายทาง ฿${tx.amount.toLocaleString()} ให้ผู้ใช้เรียบร้อย`, 'success');
    }

    saveTransactions(updatedTx);
  };

  const handleRejectTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    // Reject state
    const updatedTx = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'rejected' as const };
      return t;
    });

    if (tx.type === 'withdraw') {
      // Refund balance to customer
      const updatedUsers = users.map(u => {
        if (u.id === tx.userId) {
          return { ...u, balance: u.balance + tx.amount };
        }
        return u;
      });
      saveUsers(updatedUsers);
      triggerAlert(`ปฏิเสธคำขอถอนเงิน: ทำการคืนยอดเครดิต ฿${tx.amount.toLocaleString()} คืนสู่หน้าจอผู้ใช้`, 'warning');
    } else {
      triggerAlert(`ยกเลิกและปฏิเสธบิลสลิปฝากเงิน ฿${tx.amount.toLocaleString()} ชัดเจน`, 'info');
    }

    saveTransactions(updatedTx);
  };

  // 5.4 จัดการสถานะลูกค้า
  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: newStatus as 'active' | 'suspended' };
      }
      return u;
    });
    saveUsers(updatedUsers);
    triggerAlert(`อัปเดตสิทธิ์ผู้เล่นสำเร็จ`, 'info');
  };

  // 5.5 อนุมัติโบนัส / เครดิตแอตทริคแอดมิน
  const handleAddCredit = (userId: string, amount: number) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, balance: u.balance + amount };
      }
      return u;
    });
    saveUsers(updatedUsers);
    triggerAlert(`อินเจกต์เครดิตสิทธิ์ความพึงพอใจ ฿${amount.toLocaleString()} สำเร็จ`, 'success');
  };

  // 6. DRAW LOTTERY & PROCESS WINNERS
  const handleDrawLottery = (drawDateStr: string, number3Up: string, number2Down: string) => {
    // Generate permutations for 3tod (Table permutation logic)
    const set3Tod = new Set<string>();
    const permute = (str: string, l: number, r: number) => {
      if (l === r) {
        set3Tod.add(str);
      } else {
        for (let i = l; i <= r; i++) {
          const arr = str.split('');
          const temp = arr[l];
          arr[l] = arr[i];
          arr[i] = temp;
          permute(arr.join(''), l + 1, r);
        }
      }
    };
    permute(number3Up, 0, 2);

    const result3Tod = Array.from(set3Tod);
    const result2Up = number3Up.substring(1); // last 2 digits of top!

    // Save drawn results
    const newDraw: DrawResult = {
      id: 'draw-' + Math.random().toString(36).substring(4),
      drawDate: drawDateStr,
      result3Up: number3Up,
      result3Tod,
      result2Up,
      result2Down: number2Down,
      status: 'drawn'
    };

    // Evaluate pending lotto tickets!
    let totalWonCredits = 0;
    const tempUsers = [...users];

    const updatedPurchases = purchases.map(p => {
      if (p.status !== 'pending') return p; // already evaluated

      let isWin = false;
      if (p.type === '3up' && p.ticketNumber === number3Up) isWin = true;
      else if (p.type === '3tod' && result3Tod.includes(p.ticketNumber)) isWin = true;
      else if (p.type === '2up' && p.ticketNumber === result2Up) isWin = true;
      else if (p.type === '2down' && p.ticketNumber === number2Down) isWin = true;

      if (isWin) {
        const wonAmount = p.amount * p.payoutRate;
        totalWonCredits += wonAmount;

        // Reward customer
        const userIdx = tempUsers.findIndex(u => u.id === p.userId);
        if (userIdx !== -1) {
          tempUsers[userIdx].balance += wonAmount;
        }

        return {
          ...p,
          status: 'won' as const,
          wonAmount
        };
      } else {
        return {
          ...p,
          status: 'lost' as const,
          wonAmount: 0
        };
      }
    });

    // Clear limit counters for next period
    const resetLimits = limits.map(l => ({ ...l, currentAmount: 0 }));

    saveUsers(tempUsers);
    savePurchases(updatedPurchases);
    saveLimits(resetLimits);
    saveDraws([newDraw, ...drawResults]);

    triggerAlert(`ประมวลผลรางวัลและแจกสลิปโอนเสร็จสิ้น! บัญชีสลากที่ร่วมชิงโชคได้รับเงินชดเชยรวม ฿${totalWonCredits.toLocaleString()}`, 'success');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Absolute Admin control switcher */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 text-xs shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold font-mono uppercase text-[10px] tracking-wider shadow-sm">LOTTO PRO</span>
            <span className="text-slate-300 font-medium font-sans">แผงจำลองสถานะระบบจับสลาก — สลับบทบาทเพื่อทดสอบได้ทันที</span>
          </div>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1">
            <button
              onClick={() => {
                setCurrentRole('customer');
                // Auto login to sample somchai to make testing fast!
                if (!currentUser) {
                  const cust = users.find(u => u.role === 'customer');
                  if (cust) setCurrentUser(cust);
                }
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer ${
                currentRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              มุมมองลูกค้า (Client Hub)
            </button>
            <button
              onClick={() => {
                setCurrentRole('admin');
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              แผงหลังบ้าน (Admin Console)
            </button>
          </div>
        </div>
      </div>

      {/* Sweet Alert Notification Toast */}
      <AnimatePresence>
        {alertNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border ${
              alertNotification.type === 'success'
                ? 'bg-white border-green-200 text-green-900 shadow-green-500/5'
                : alertNotification.type === 'warning'
                ? 'bg-white border-red-200 text-red-950 shadow-red-500/5'
                : 'bg-white border-indigo-200 text-indigo-950 shadow-indigo-500/5'
            }`}>
              <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                alertNotification.type === 'success' ? 'text-green-500' : alertNotification.type === 'warning' ? 'text-red-500' : 'text-indigo-500'
              }`} />
              <div className="flex-1">
                <span className="text-xs font-bold block">แจ้งเตือนระบบปฏิบัติการ</span>
                <p className="text-xs text-gray-600 mt-0.5 font-semibold leading-relaxed">
                  {alertNotification.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render selected workspace view */}
      <div>
        {currentRole === 'customer' ? (
          <CustomerPortal
            currentUser={currentUser}
            users={users}
            purchases={purchases}
            transactions={transactions}
            drawResults={drawResults}
            payouts={payouts}
            limits={limits}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onBuyTickets={handleBuyTickets}
          />
        ) : (
          <AdminPortal
            users={users}
            purchases={purchases}
            transactions={transactions}
            drawResults={drawResults}
            payouts={payouts}
            limits={limits}
            onAddLimit={handleAddLimit}
            onRemoveLimit={handleRemoveLimit}
            onUpdatePayout={handleUpdatePayout}
            onApproveTransaction={handleApproveTransaction}
            onRejectTransaction={handleRejectTransaction}
            onToggleUserStatus={handleToggleUserStatus}
            onAddCredit={handleAddCredit}
            onDrawLottery={handleDrawLottery}
          />
        )}
      </div>

    </div>
  );
}
