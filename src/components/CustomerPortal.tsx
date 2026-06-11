import { useState, FormEvent } from 'react';
import { 
  User, 
  LottoType, 
  Purchase, 
  Transaction, 
  DrawResult, 
  PayoutMultiplier, 
  LottoLimit 
} from '../types';
import { 
  UserPlus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  History, 
  CheckCircle, 
  Eye, 
  X, 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Search, 
  Calendar,
  Lock,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPortalProps {
  currentUser: User | null;
  users: User[];
  purchases: Purchase[];
  transactions: Transaction[];
  drawResults: DrawResult[];
  payouts: PayoutMultiplier[];
  limits: LottoLimit[];
  onRegister: (username: string, phone: string) => void;
  onLogin: (userId: string) => void;
  onLogout: () => void;
  onDeposit: (amount: number, bankName: string, bankAccount: string) => void;
  onWithdraw: (amount: number, bankName: string, bankAccount: string) => void;
  onBuyTickets: (cart: { number: string; type: LottoType; amount: number }[]) => { success: boolean; message: string };
  onClose?: () => void;
}

export default function CustomerPortal({
  currentUser,
  users,
  purchases,
  transactions,
  drawResults,
  payouts,
  limits,
  onRegister,
  onLogin,
  onLogout,
  onDeposit,
  onWithdraw,
  onBuyTickets
}: CustomerPortalProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'buy' | 'history' | 'finance' | 'results'>('buy');
  
  // Registration Form
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Financial States
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depBank, setDepBank] = useState('ธนาคารกสิกรไทย (KBank)');
  const [depAccount, setDepAccount] = useState('');
  const [depositSlip, setDepositSlip] = useState<File | null>(null);
  const [depositNote, setDepositNote] = useState('');
  
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [witBank, setWitBank] = useState('ธนาคารกสิกรไทย (KBank)');
  const [witAccount, setWitAccount] = useState('');
  const [witError, setWitError] = useState('');
  const [financeMessage, setFinanceMessage] = useState('');

  // Shopping Cart State
  const [cartNumber, setCartNumber] = useState('');
  const [cartType, setCartType] = useState<LottoType>('3up');
  const [cartAmount, setCartAmount] = useState<number>(100);
  const [cart, setCart] = useState<{ id: string; number: string; type: LottoType; amount: number }[]>([]);
  const [cartError, setCartError] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Result search
  const [searchDrawDate, setSearchDrawDate] = useState('');

  // Handle register
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPhone.trim()) {
      setRegError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (regPhone.length < 9) {
      setRegError('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง');
      return;
    }
    onRegister(regUsername, regPhone);
    setRegSuccess(true);
    setRegUsername('');
    setRegPhone('');
    setRegError('');
    setTimeout(() => setRegSuccess(false), 3000);
  };

  // Deposit handler
  const handleDepositSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    onDeposit(depositAmount, depBank, depAccount || '123-x-xxxx-x');
    setFinanceMessage('ส่งคำขอฝากเงินเรียบร้อยแล้ว! แอดมินกำลังตรวจสอบความถูกต้องสลิป');
    setDepositAmount(500);
    setDepAccount('');
    setDepositSlip(null);
    setTimeout(() => setFinanceMessage(''), 5000);
  };

  // Withdraw handler
  const handleWithdrawSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (withdrawAmount <= 0) {
      setWitError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (withdrawAmount > currentUser.balance) {
      setWitError('ยอดเงินคงเหลือไม่เพียงพอสำหรับถอนจำนวนนี้');
      return;
    }
    if (!witAccount.trim()) {
      setWitError('กรุณากรอกเลขบัญชีธนาคาร');
      return;
    }
    
    onWithdraw(withdrawAmount, witBank, witAccount);
    setFinanceMessage('ส่งคำขอถอนเงินเรียบร้อยแล้ว! ฝ่ายบัญชีจะโอนเงินเข้าบัญชีคุณทันทีหลังพิจารณา');
    setWithdrawAmount(500);
    setWitAccount('');
    setWitError('');
    setTimeout(() => setFinanceMessage(''), 5000);
  };

  // Shopping cart managers
  const handleAddToCard = () => {
    setPurchaseStatus(null);
    if (!cartNumber.trim()) {
      setCartError('กรุณาระบุตัวเลข');
      return;
    }

    // Validation pattern
    const isThreeDigit = cartType === '3up' || cartType === '3tod';
    if (isThreeDigit && (cartNumber.length !== 3 || isNaN(Number(cartNumber)))) {
      setCartError('แบบ 3 ตัว ต้องระบุตัวเลข 3 หลัก (เช่น 924)');
      return;
    }
    if (!isThreeDigit && (cartNumber.length !== 2 || isNaN(Number(cartNumber)))) {
      setCartError('แบบ 2 ตัว ต้องระบุตัวเลข 2 หลัก (เช่น 65)');
      return;
    }

    if (cartAmount <= 0 || isNaN(cartAmount)) {
      setCartError('กรุณาระบุยอดซื้อให้ถูกต้อง (ขั้นต่ำ 1 บาท)');
      return;
    }

    // Check limits dynamically to warn the user
    const limitForNum = limits.find(l => l.number === cartNumber && l.type === cartType);
    if (limitForNum) {
      const remainingLimit = limitForNum.maxLimit - limitForNum.currentAmount;
      if (remainingLimit <= 0) {
        setCartError(`เลข ${cartNumber} (${getPayoutLabel(cartType)}) ปิดรับเนื่องจากเต็มโควต้าแล้ว`);
        return;
      }
      if (cartAmount > remainingLimit) {
        setCartError(`เลข ${cartNumber} รับเพิ่มได้อีกไม่เกิน ${remainingLimit} บาท เท่านั้น`);
        return;
      }
    }

    // Add to cart
    const newItem = {
      id: Math.random().toString(36).substring(7),
      number: cartNumber,
      type: cartType,
      amount: Number(cartAmount)
    };

    setCart([...cart, newItem]);
    setCartNumber('');
    setCartError('');
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setCartError('กรุณาลงชื่อเข้าใช้เพื่อทำการซื้อเลข');
      return;
    }
    if (cart.length === 0) {
      setCartError('ไม่มีสินค้าในตระกร้า');
      return;
    }

    const totalCost = cart.reduce((sum, item) => sum + item.amount, 0);
    if (totalCost > currentUser.balance) {
      setCartError('ยอดคงเหลือของคุณไม่พอ กรุณาเติมเงินเข้าระบบก่อนซื้อ');
      return;
    }

    const res = onBuyTickets(cart);
    setPurchaseStatus(res);
    if (res.success) {
      setCart([]);
    }
  };

  const getPayoutLabel = (type: LottoType) => {
    return payouts.find(p => p.type === type)?.label || type;
  };

  const getPayoutRate = (type: LottoType) => {
    return payouts.find(p => p.type === type)?.multiplier || 0;
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Header Profile Info in Slate Theme */}
      <div className="bg-slate-900 border-b border-slate-800 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/25">
              <Coins className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SIAM LOTTO <span className="text-[10px] bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/30">PRO</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">ระบบจัดการและสั่งซื้อโควต้าสลากอัตโนมัติ</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4 bg-slate-950/60 px-5 py-2.5 rounded-xl border border-slate-800/80 w-full md:w-auto justify-between md:justify-start">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">บัญชีผู้ใช้</span>
                <span className="font-semibold text-xs text-slate-200 block">{currentUser.username}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">เครดิตบัญชีคงเหลือ</span>
                <span className="text-base font-bold text-blue-400 block font-mono">฿{currentUser.balance.toLocaleString('th-TH')}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-[11px] font-bold bg-slate-850 hover:bg-red-600/10 hover:text-red-400 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              {/* Quick Logins for Demo */}
              <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 uppercase font-mono font-bold">บัญชีเดโม:</span>
                <div className="flex gap-1.5">
                  {users.filter(u => u.role === 'customer').slice(0, 3).map(u => (
                    <button
                      key={u.id}
                      onClick={() => onLogin(u.id)}
                      className="text-xs font-semibold bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      title={u.username}
                    >
                      {u.username.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentUser ? (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Tabs Navigation in Premium Grey Slate Theme */}
          <div className="flex border border-slate-200/60 mb-6 bg-white/80 backdrop-blur-md rounded-xl p-1 gap-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <Coins className="w-4 h-4" />
              ซื้อเลขรางวัล
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <History className="w-4 h-4" />
              ประวัติส่วนตัว
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'finance'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              ธุรกรรม ฝาก/ถอน
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              ผลสลาก & ตรวจรางวัล
            </button>
          </div>

          {/* Active Tab Panel */}
          <div>
            {/* BUY NUMBERS TAB */}
            {activeTab === 'buy' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Rules & Payout Rates Information banner based on blue color theme */}
                <div className="lg:col-span-12 bg-blue-50/60 border border-blue-100 rounded-xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Compass className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm">ข้อตกลงและอัตราการจ่ายเงินรางวัลในระบบปัจจุบัน</h4>
                      <p className="text-xs text-slate-500">อัตราจ่ายสะท้อนมูลค่าความปลอดภัยแบบ Real-time มีลิมิตจำกัดความเสี่ยงอย่างเป็นธรรมประธานโครงการ</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 font-mono text-xs font-semibold bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                    {payouts.map((p) => (
                      <div key={p.type} className="flex gap-2 items-center">
                        <span className="text-slate-400 block font-normal">{p.label}:</span>
                        <span className="text-blue-600 block">฿{p.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entry pad */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plus className="w-4 h-4 text-blue-600" />
                    ระบุตัวเลขและโควต้าสั่งซื้อ
                  </h3>

                  <div className="space-y-4">
                    {/* Lotto category */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">ประเภทแทงสลากรางวัล</label>
                      <div className="grid grid-cols-4 gap-2">
                        {payouts.map(p => (
                          <button
                            key={p.type}
                            type="button"
                            onClick={() => {
                              setCartType(p.type);
                              setCartNumber('');
                              setCartError('');
                            }}
                            className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                              cartType === p.type
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/15'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <span className="block mb-0.5 font-bold text-sm">{p.label}</span>
                            <span className={`text-[10px] block font-mono ${cartType === p.type ? 'text-blue-200' : 'text-slate-400'}`}>จ่าย {p.multiplier}x</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          เลขที่ต้องการซื้อ {cartType === '3up' || cartType === '3tod' ? '(แนะนำ 3 หลัก)' : '(แนะนำ 2 หลัก)'}
                        </label>
                        <input
                          type="text"
                          maxLength={cartType === '3up' || cartType === '3tod' ? 3 : 2}
                          value={cartNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCartNumber(val);
                            setCartError('');
                          }}
                          placeholder={cartType === '3up' || cartType === '3tod' ? '924' : '65'}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold font-mono tracking-widest text-center focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">จำนวนเงินเดิมพัน (บาท)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-slate-400 font-mono text-sm font-bold">฿</span>
                          <input
                            type="number"
                            min="1"
                            value={cartAmount || ''}
                            onChange={(e) => {
                              setCartAmount(Number(e.target.value));
                              setCartError('');
                            }}
                            placeholder="100"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold font-mono focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick values selector */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider mb-2">ทางลัดกำหนดมูลค่าการแทง</span>
                      <div className="flex gap-2">
                        {[10, 50, 100, 200, 500, 1000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCartAmount(val)}
                            className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold cursor-pointer"
                          >
                            ฿{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status limitations warnings if matching is closed or hot */}
                    {cartNumber.length > 0 && (
                      <div className="p-3.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-mono flex items-center justify-between">
                        <div>
                          <span className="text-slate-450 block text-[10px] font-bold uppercase tracking-wider">ประมาณการยอดเงินรางวัล:</span>
                          <span className="font-bold text-slate-800">
                            หากชิงรางวัล ฿{cartAmount.toLocaleString()} จ่าย ฿{(cartAmount * getPayoutRate(cartType)).toLocaleString()} บาท
                          </span>
                        </div>
                        {limits.find(l => l.number === cartNumber && l.type === cartType) && (
                          <div className="text-right">
                            <span className="text-red-600 font-bold block flex items-center gap-1 justify-end">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              เลขอั้น / มีโควต้าเต็มพิกัด
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              แทงได้อีกไม่เกิน ฿{(limits.find(l => l.number === cartNumber && l.type === cartType)!.maxLimit - limits.find(l => l.number === cartNumber && l.type === cartType)!.currentAmount).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {cartError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {cartError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddToCard}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wider uppercase py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5 font-bold" />
                      เพิ่มลงตระกร้าสลาก
                    </button>
                  </div>
                </div>

                {/* Shopping cart details */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[400px]">
                  <div>
                    <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Coins className="w-4 h-4 text-blue-600" />
                        รายการสลากที่เตรียมซื้อ ({cart.length})
                      </h3>
                      {cart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCart([])}
                          className="text-xs text-red-500 hover:text-red-600 font-bold uppercase transition-all cursor-pointer"
                        >
                          ล้างตะกร้า
                        </button>
                      )}
                    </div>

                    {cart.length === 0 ? (
                      <div className="py-14 text-center text-slate-400">
                        <Compass className="w-10 h-10 stroke-[1.25] mx-auto text-slate-300 mb-3" />
                        <p className="text-xs leading-relaxed font-semibold">ยังไม่มีเลขในตะกร้าสลากสะสม<br />เลือกประเภทและพิมพ์ตัวเลขด้านซ้ายเพื่อเพิ่ม</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                          {cart.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="bg-blue-50 text-blue-600 font-mono font-bold text-base w-12 h-12 flex items-center justify-center rounded-xl border border-blue-100 shadow-sm">
                                  {item.number}
                                </span>
                                <div>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100/60 text-blue-800 inline-block mb-1 font-sans">
                                    {getPayoutLabel(item.type)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    อัตราจ่าย x{getPayoutRate(item.type)} เท่า
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="font-bold text-sm font-mono text-slate-800">
                                  ฿{item.amount.toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  className="text-slate-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="border-t border-slate-100 pt-4 mt-4 space-y-3.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-semibold">ยอดเดิมพันสะสมทั้งสิ้น:</span>
                      <span className="font-bold font-mono text-slate-900 text-lg">
                        ฿{cart.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-450 font-semibold">วงเงินเครดิตคงเหลือ:</span>
                      <span className="font-bold text-blue-600 block font-mono">
                        ฿{currentUser.balance.toLocaleString()}
                      </span>
                    </div>

                    {purchaseStatus && (
                      <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold ${
                        purchaseStatus.success 
                          ? 'bg-green-50 border border-green-150 text-green-700' 
                          : 'bg-red-50 border border-red-150 text-red-650'
                      }`}>
                        {purchaseStatus.success ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                        {purchaseStatus.message}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-200" />
                      กดยืนยันการสั่งซื้อหลักสูตรสลาก
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* PERSONAL HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <History className="w-4 h-4 text-blue-600" />
                  ประวัติบิลรายการสลากที่ส่งคำสั่งซื้อแล้ว
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-4">เลขที่อ้างอิงบิล</th>
                        <th className="py-3 px-4">วันที่ซื้อ</th>
                        <th className="py-3 px-4 text-center">สลากประเภท</th>
                        <th className="py-3 px-4 text-center">ตัวเลขที่แทง</th>
                        <th className="py-3 px-4 text-right">ยอดเงินเดิมพัน</th>
                        <th className="py-3 px-4 text-center">อัตราจ่าย</th>
                        <th className="py-3 px-4 text-center">สถานะรางวัล</th>
                        <th className="py-3 px-4 text-right">ได้รับเงิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchases
                        .filter(p => p.userId === currentUser.id)
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">#{p.id}</td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">
                              {new Date(p.purchaseDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-block">
                                {getPayoutLabel(p.type)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-base text-slate-800 font-mono tracking-wider">
                                {p.ticketNumber}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">
                              ฿{p.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                              x{p.payoutRate}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider ${
                                p.status === 'won'
                                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                                  : p.status === 'lost'
                                  ? 'bg-red-50 text-red-600 border border-red-250 shadow-sm'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm animate-pulse'
                              }`}>
                                {p.status === 'won' ? 'ถูกรางวัล' : p.status === 'lost' ? 'ไม่ถูกรางวัล' : 'เปิดรวบรวมข้อมูลรางวัล'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-green-600 font-mono">
                              {p.status === 'won' ? `฿${p.wonAmount?.toLocaleString()}` : p.status === 'lost' ? '฿0' : '-'}
                            </td>
                          </tr>
                        ))}
                      {purchases.filter(p => p.userId === currentUser.id).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">ยังไม่พบบันทึกการซื้อของคุณสลาก</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'finance' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Deposit Form */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    แจ้งทำรายการฝากเงินเครดิตเข้ากระเป๋า
                  </h3>

                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ฝากยอดจำนวน (บาท)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-mono text-sm font-semibold">฿</span>
                        <input
                          type="number"
                          required
                          min="100"
                          value={depositAmount || ''}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 font-bold font-mono text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-sans"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">ขั้นต่ำในการถอน/ฝากเครดิตคือ 100 บาท</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ช่องทางฝากรับเงินปลายทาง</label>
                        <select
                          value={depBank}
                          onChange={(e) => setDepBank(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-sans cursor-pointer"
                        >
                          <option>ธนาคารกสิกรไทย (KBank)</option>
                          <option>ธนาคารไทยพาณิชย์ (SCB)</option>
                          <option>ธนาคารกรุงเทพ (BBL)</option>
                          <option>ธนาคารกรุงไทย (KTB)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">เลขบัญชีที่โอน (เพื่อยืนยัน)</label>
                        <input
                          type="text"
                          required
                          value={depAccount}
                          onChange={(e) => setDepAccount(e.target.value)}
                          placeholder="xxx-x-xxxx8-x"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs tracking-wide outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Drag-and-drop slip simulation */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">แนบหลักฐานสลิปการโอน</label>
                      <div className="border border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-blue-50/10 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setDepositSlip(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Download className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-bold text-blue-600 block mb-0.5">คลิกหรือลากไฟล์หลักฐานสลิปมาวางที่นี่</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {depositSlip ? `อัปโหลดแล้ว: ${depositSlip.name}` : 'จำลองอัปโหลดภาพ (.png, .jpg)'}
                        </span>
                      </div>
                    </div>

                    {financeMessage && (
                      <div className="p-3 bg-green-50 text-green-700 border border-green-150 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        {financeMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/10"
                    >
                      <Coins className="w-4 h-4" />
                      กดยืนยันใบฝากเงินเข้าสู่ระบบ
                    </button>
                  </form>
                </div>

                {/* Withdraw Form */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ArrowDownLeft className="w-4 h-4 text-red-500" />
                    แจ้งทำรายการถอนเงินออกจากบัญชีคงเหลือ
                  </h3>

                  <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ยอดถอนเครดิต (บาท)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-mono text-sm font-semibold">฿</span>
                        <input
                          type="number"
                          required
                          min="100"
                          value={withdrawAmount || ''}
                          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 font-bold font-mono text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-sans"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        ถอนขั้นต่ำสุด 100 บาท (โควต้าคงเหลือในระบบ: ฿{currentUser.balance.toLocaleString()})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">เลือกธนาคารปลายทาง</label>
                        <select
                          value={witBank}
                          onChange={(e) => setWitBank(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-sans cursor-pointer"
                        >
                          <option>ธนาคารกสิกรไทย (KBank)</option>
                          <option>ธนาคารไทยพาณิชย์ (SCB)</option>
                          <option>ธนาคารกรุงเทพ (BBL)</option>
                          <option>ธนาคารกรุงไทย (KTB)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-sans">เลขบัญชีรับเงินโอน</label>
                        <input
                          type="text"
                          required
                          value={witAccount}
                          onChange={(e) => setWitAccount(e.target.value)}
                          placeholder="xxx-x-xxxx8-x"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-xs tracking-wide outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    {witError && (
                      <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {witError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      กดยืนยันจัดส่งแจ้งเตือนถอนเงิน
                    </button>
                  </form>
                </div>

                {/* Users transaction histories */}
                <div className="lg:col-span-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                    ประวัติรายการฝากและถอนโอนของคุณเฉพาะบิลล่าสุด
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                          <th className="py-2.5 px-4 font-normal">รหัสสตรีม</th>
                          <th className="py-2.5 px-4 font-normal">วันและเวลาที่ส่ง</th>
                          <th className="py-2.5 px-4 font-normal">รูปแบบ</th>
                          <th className="py-2.5 px-4 font-normal text-right">จำนวนเงิน</th>
                          <th className="py-2.5 px-4 font-normal">ธนาคารส่งเรื่อง</th>
                          <th className="py-2.5 px-4 font-normal">เลขบัญชีธนาคาร</th>
                          <th className="py-2.5 px-4 font-normal text-center">ผลการตรวจสอบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions
                          .filter(t => t.userId === currentUser.id)
                          .map((t) => (
                            <tr key={t.id} className="text-xs hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-mono text-slate-400">#{t.id}</td>
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {new Date(t.timestamp).toLocaleString('th-TH')}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-bold text-[11px] uppercase ${t.type === 'deposit' ? 'text-green-600' : 'text-amber-600'}`}>
                                  {t.type === 'deposit' ? 'ฝากเงินเครดิต' : 'ถอนเงินรางวัล'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-700 font-mono">
                                ฿{t.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-600 font-semibold">{t.bankName || '-'}</td>
                              <td className="py-3 px-4 font-mono text-slate-500">{t.bankAccount || '-'}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider ${
                                  t.status === 'completed'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : t.status === 'rejected'
                                    ? 'bg-red-50 text-red-650 border border-red-150'
                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse'
                                }`}>
                                  {t.status === 'completed' ? 'อนุมัติผ่าน' : t.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        {transactions.filter(t => t.userId === currentUser.id).length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold text-xs">ยังไม่มีประวัติทำรายการธุรกรรม</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* RESULTS DETAILS PANEL */}
            {activeTab === 'results' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Search result header bar */}
                <div className="md:col-span-12 bg-white p-4.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">ค้นหาตามประวัติการลงผลสลากหวยสิงคโปร์ / รัฐ</span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={searchDrawDate}
                      onChange={(e) => setSearchDrawDate(e.target.value)}
                      className="bg-slate-50 font-mono text-xs border border-slate-200 pl-9 pr-4 py-2 rounded-lg outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 tracking-wider"
                    />
                  </div>
                </div>

                {/* Drawings list card */}
                {drawResults
                  .filter(draw => !searchDrawDate || draw.drawDate === searchDrawDate)
                  .map((draw) => (
                    <div key={draw.id} className="md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-slate-800">
                        <div>
                          <span className="text-[9px] text-blue-400 font-bold block tracking-widest uppercase">หวยรัฐบาล & ออมสินสากล</span>
                          <span className="text-sm font-bold tracking-tight">
                            งวดวันที่ {new Date(draw.drawDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded ${
                          draw.status === 'drawn' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' : 'bg-yellow-500/20 text-yellow-300 animate-pulse'
                        }`}>
                          {draw.status === 'drawn' ? 'ประกาศผลแล้ว' : 'รอนำออกสุ่มจับ'}
                        </span>
                      </div>

                      {draw.status === 'drawn' ? (
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                              <span className="text-[10px] text-slate-500 block mb-1 font-bold">สามตัวตรง (3 ตัวบน)</span>
                              <span className="text-3xl font-extrabold text-blue-600 tracking-widest font-mono">
                                {draw.result3Up}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                              <span className="text-[10px] text-slate-500 block mb-1 font-bold">สองตัวล่าง (2 ตัวล่าง)</span>
                              <span className="text-3xl font-extrabold text-slate-800 tracking-widest font-mono">
                                {draw.result2Down}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="bg-slate-100/50 px-3 py-2 rounded-lg flex justify-between">
                              <span className="text-slate-400">2 ตัวบน:</span>
                              <span className="font-bold text-slate-800">{draw.result2Up}</span>
                            </div>
                            <div className="bg-slate-100/50 px-3 py-2 rounded-lg flex justify-between">
                              <span className="text-slate-400">3 ตัวโต๊ด:</span>
                              <span className="font-bold text-slate-800 tracking-wider truncate max-w-[130px]" title={draw.result3Tod.join(', ')}>
                                {draw.result3Tod.slice(0, 3).join(',')}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 text-center text-slate-400">
                          <Compass className="w-10 h-10 stroke-[1.25] mx-auto text-yellow-500 animate-spin mb-3" />
                          <span className="text-xs font-bold block text-slate-700 mb-1">ยังไม่เริ่มต้นจับผลรางวัล</span>
                          <span className="text-[11px] block text-slate-400">ระบบอยู่ระหว่างดำเนินการตรวจสอบความปลอดภัย</span>
                        </div>
                      )}
                    </div>
                ))}

              </div>
            )}
          </div>
        </div>
      ) : (
        /* REGISTER OR QUICK ENTRY PAGE */
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3.5 bg-blue-50 rounded-2xl text-blue-600 mb-3 shadow-sm border border-blue-100/50">
                <Coins className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 uppercase">แพลตฟอร์มสยาม ล็อตโต้ โปร</h2>
              <p className="text-xs text-slate-500 mt-1.5 font-sans leading-relaxed">ระบบจำลองการจัดการสลากรางวัลที่ปลอดภัยและถูกระเบียบ ท้องถิ่น ลงทะเบียนรับเครดิตทดลองทันที ฿500</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ชื่อผู้ใช้ระบบตรวจรางวัล</label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      setRegError('');
                    }}
                    placeholder="สมศักดิ์ แสนสุข"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-semibold text-slate-800 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-sans">เบอร์โทรศัพท์มือถือ</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setRegPhone(val);
                      setRegError('');
                    }}
                    placeholder="0812345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-mono tracking-wider font-bold text-slate-800"
                  />
                </div>
              </div>

              {regError && (
                <div className="p-3.5 bg-red-50 text-red-600 border border-red-150 rounded-xl text-xs font-semibold">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="p-3.5 bg-green-50 text-green-700 border border-green-150 rounded-xl text-xs font-bold">
                  ลงทะเบียนผู้ใช้สำเร็จ! สลับบทบาทหรือเข้าใช้งานได้ทันที
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer transition-all"
              >
                กดสร้างผู้ใช้งานและเริ่มทันที
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-wider uppercase">หรือกดข้ามเข้าผู้ใช้ตัวอย่าง</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="space-y-2">
              {users.filter(u => u.role === 'customer').map(u => (
                <button
                  key={u.id}
                  onClick={() => onLogin(u.id)}
                  className="w-full bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-100 rounded-xl p-3 text-left font-semibold text-xs text-slate-700 flex justify-between items-center transition-all cursor-pointer shadow-sm"
                >
                  <div className="font-sans">
                    <span className="block text-slate-900 font-bold">{u.username} <span className="font-mono text-slate-400 text-[11px] font-normal">({u.phone})</span></span>
                    <span className="text-[10px] text-slate-500 font-mono">เครดิตทดลองประจำตัว: ฿{u.balance.toLocaleString()}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
