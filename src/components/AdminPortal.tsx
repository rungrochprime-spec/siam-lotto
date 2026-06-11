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
  LayoutDashboard, 
  UserCheck, 
  Coins, 
  Sliders, 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag, 
  ShieldAlert, 
  UserX, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  X,
  Compass,
  Award,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPortalProps {
  users: User[];
  purchases: Purchase[];
  transactions: Transaction[];
  drawResults: DrawResult[];
  payouts: PayoutMultiplier[];
  limits: LottoLimit[];
  onAddLimit: (number: string, type: LottoType, maxLimit: number) => void;
  onRemoveLimit: (number: string, type: LottoType) => void;
  onUpdatePayout: (type: LottoType, multiplier: number) => void;
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onAddCredit: (userId: string, amount: number) => void;
  onDrawLottery: (drawDate: string, number3Up: string, number2Down: string) => void;
}

export default function AdminPortal({
  users,
  purchases,
  transactions,
  drawResults,
  payouts,
  limits,
  onAddLimit,
  onRemoveLimit,
  onUpdatePayout,
  onApproveTransaction,
  onRejectTransaction,
  onToggleUserStatus,
  onAddCredit,
  onDrawLottery
}: AdminPortalProps) {
  // Tabs Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'limits' | 'payouts' | 'transactions' | 'users' | 'draw'>('dashboard');

  // Limit States
  const [newLimNumber, setNewLimNumber] = useState('');
  const [newLimType, setNewLimType] = useState<LottoType>('3up');
  const [newLimMax, setNewLimMax] = useState<number>(5000);
  const [limError, setLimError] = useState('');

  // Payout Adjust States
  const [payoutInputs, setPayoutInputs] = useState<Record<LottoType, number>>({
    '3up': payouts.find(p => p.type === '3up')?.multiplier || 900,
    '3tod': payouts.find(p => p.type === '3tod')?.multiplier || 150,
    '2up': payouts.find(p => p.type === '2up')?.multiplier || 95,
    '2down': payouts.find(p => p.type === '2down')?.multiplier || 95
  });
  const [payoutFeedbacks, setPayoutFeedbacks] = useState<string>('');

  // User Credit Inject State
  const [creditInjections, setCreditInjections] = useState<Record<string, number>>({});

  // Lottery Draw Form
  const [drawDate, setDrawDate] = useState('2026-06-16');
  const [draw3Up, setDraw3Up] = useState('');
  const [draw2Down, setDraw2Down] = useState('');
  const [drawError, setDrawError] = useState('');
  const [drawSuccess, setDrawSuccess] = useState('');

  // 1. ANALYTICAL SYSTEM CALCULATIONS
  // Total pending pool & historical totals
  const totalSalesHistorical = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalWonHistorical = purchases.reduce((sum, p) => sum + (p.wonAmount || 0), 0);
  const totalProfitHistorical = totalSalesHistorical - totalWonHistorical;

  // Pending (current active) sales
  const currentPendingPurchases = purchases.filter(p => p.status === 'pending');
  const sizePendingSales = currentPendingPurchases.reduce((sum, p) => sum + p.amount, 0);

  // Daily Sales Analysis (mocked timeline group by purchaseDate)
  const dailySales: Record<string, number> = {};
  purchases.forEach(p => {
    const dStr = new Date(p.purchaseDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    dailySales[dStr] = (dailySales[dStr] || 0) + p.amount;
  });

  // Top Selling numbers analysis
  const topSellersMap: Record<string, { totalAmount: number; type: LottoType }> = {};
  purchases.forEach(p => {
    const key = `${p.ticketNumber}-${p.type}`;
    if (!topSellersMap[key]) {
      topSellersMap[key] = { totalAmount: 0, type: p.type };
    }
    topSellersMap[key].totalAmount += p.amount;
  });
  const topSellersList = Object.entries(topSellersMap)
    .map(([key, info]) => {
      const [num] = key.split('-');
      return { number: num, type: info.type, totalAmount: info.totalAmount };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  // Risk & Liability Index (Potential payouts per number if it wins!)
  // For each distinct number/type in pending, calculate liability = summation(amount * multiplier)
  const liabilitiesMap: Record<string, { totalLiability: number; totalSold: number; type: LottoType; label: string }> = {};
  currentPendingPurchases.forEach(p => {
    const key = `${p.ticketNumber}-${p.type}`;
    if (!liabilitiesMap[key]) {
      const multiplier = payouts.find(pay => pay.type === p.type)?.multiplier || 1;
      const label = payouts.find(pay => pay.type === p.type)?.label || p.type;
      liabilitiesMap[key] = { totalLiability: 0, totalSold: 0, type: p.type, label };
    }
    const mult = payouts.find(pay => pay.type === p.type)?.multiplier || 1;
    liabilitiesMap[key].totalSold += p.amount;
    liabilitiesMap[key].totalLiability += (p.amount * mult);
  });
  const liabilitiesList = Object.entries(liabilitiesMap)
    .map(([key, info]) => {
      const [number] = key.split('-');
      return { number, ...info };
    })
    .sort((a, b) => b.totalLiability - a.totalLiability);

  // Handler for limits additions
  const handleAddLim = (e: FormEvent) => {
    e.preventDefault();
    if (!newLimNumber.trim()) {
      setLimError('กรุณาระบุเลข');
      return;
    }
    const is3D = newLimType === '3up' || newLimType === '3tod';
    if (is3D && newLimNumber.length !== 3) {
      setLimError('หวยแบบ 3 ตัว ต้องระบุเลข 3 หลัก');
      return;
    }
    if (!is3D && newLimNumber.length !== 2) {
      setLimError('หวยแบบ 2 ตัว ต้องระบุเลข 2 หลัก');
      return;
    }
    if (newLimMax <= 0) {
      setLimError('ขีดจำกัดสูงสุดต้องมากกว่า 0 บาท');
      return;
    }

    onAddLimit(newLimNumber, newLimType, newLimMax);
    setNewLimNumber('');
    setLimError('');
  };

  const handleUpdatePayoutRate = (type: LottoType) => {
    const inputVal = payoutInputs[type];
    if (inputVal <= 0) return;
    onUpdatePayout(type, inputVal);
    setPayoutFeedbacks(`อัปเดตอัตราจ่ายประเภท ${getPayoutLabel(type)} เป็นบาทละ ${inputVal} เรียบร้อยแล้ว`);
    setTimeout(() => setPayoutFeedbacks(''), 4000);
  };

  const executeDraw = (e: FormEvent) => {
    e.preventDefault();
    if (draw3Up.length !== 3 || isNaN(Number(draw3Up))) {
      setDrawError('กรุณาลงผล 3 ตัวบนเป็นตัวเลข 3 หลัก');
      return;
    }
    if (draw2Down.length !== 2 || isNaN(Number(draw2Down))) {
      setDrawError('กรุณาลงผล 2 ตัวล่างเป็นตัวเลข 2 หลัก');
      return;
    }

    onDrawLottery(drawDate, draw3Up, draw2Down);
    setDrawSuccess(`ทำการสุ่มและตัดสินผลสำเร็จแล้ว! ยอดผู้ถูกรางวัลได้รับการปรับยอดเครดิตทันที`);
    setDraw3Up('');
    setDraw2Down('');
    setDrawError('');
    setTimeout(() => setDrawSuccess(''), 5000);
  };

  const getPayoutLabel = (type: LottoType) => {
    return payouts.find(p => p.type === type)?.label || type;
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      
      {/* Header Dashboard Control Panel Banner */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Siam Lotto Control Center</h1>
              <p className="text-xs text-slate-500 font-sans font-medium">ระบบเจ้ามือจำลองหลังบ้านเพื่อควบคุมความเสี่ยงและความมั่นคง</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-100 p-2 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
            <span className="text-slate-700 font-bold font-sans">เซิร์ฟเวอร์ระบบ: เชื่อมต่อสมบูรณ์</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Navigation Admin Options */}
        <div className="flex bg-white p-1 rounded-xl gap-1 border border-slate-200 shadow-sm overflow-x-auto mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            สรุปข้อมูลสถิติ & ความเสี่ยง
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'limits'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            จำกัดเพดานยอดรับเลขอั้น
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4" />
            ปรับแก้ราคาจ่ายรางวัล
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-3 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            ธุรกรรมลูกค้า ({transactions.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            รายงานรายชื่อลูกค้า
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-650/15'
                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Award className="w-4 h-4" />
            ตรวจและบันทึกผลสลากรางวัล
          </button>
        </div>

        {/* Dynamic Inner views */}
        <div>
          {/* DASHBOARD & ANALYTICS VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Financial Summary Cards (ยอดขายรายวัน / กำไร / ขาดทุน) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">ยอดขายเดิมพันสะสม</span>
                      <span className="text-2xl font-bold font-mono text-slate-900">฿{totalSalesHistorical.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-3 font-semibold">รวมบิลสลากแทงสะสมทั้งสลิปปกติและสิทธิทดลอง</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">จ่ายรางวัลรางวัลสะสม</span>
                      <span className="text-2xl font-bold font-mono text-green-600">฿{totalWonHistorical.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-green-50 rounded-xl text-green-600 border border-green-100/50">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-3 font-semibold">รวมยอดโอนเครดิตให้ลูกค้าที่ทายเลขถูก</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">ผลกําไรสุทธิสุทธิในระบบ</span>
                      <span className={`text-2xl font-bold font-mono ${totalProfitHistorical >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        ฿{totalProfitHistorical.toLocaleString()}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${totalProfitHistorical >= 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                      {totalProfitHistorical >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-3 font-semibold">ผลประกอบการหลังหักรายรับลบรายจ่ายโบนัส</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider">ยอดบิลรอลุ้นประมวลผล</span>
                      <span className="text-2xl font-bold font-mono text-slate-800">฿{sizePendingSales.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 border border-slate-200">
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-3 font-semibold">ความรับผิดชอบงวดที่ดำเนินรับแทงในปัจจุบัน</span>
                </div>

              </div>

              {/* Advanced Analytical Risk Mapping and Top numbers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Risk Analysis & Potential Liability Dashboard */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        ระบบประมวลความเสี่ยงบิล (Risk & Payout Liability)
                      </h3>
                      <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">คำนวณสรุปความเป็นไปได้ในการโอนขาดทุนสูงสุดจากตัวเลือกของงวดปัจจุบัน</p>
                    </div>
                    <span className="bg-red-50 border border-red-100 text-red-600 text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                      เฝ้าระวังความคุ้ม
                    </span>
                  </div>

                  {liabilitiesList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Compass className="w-12 h-12 stroke-[1.25] mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-semibold">ไม่มีบิลงวดนี้ที่รอดำเนินการวิเคราะห์</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liabilitiesList.map((item, idx) => {
                        const safetyPercent = Math.min((item.totalLiability / 100000) * 100, 100);
                        const isHighRisk = item.totalLiability > 50000;
                        return (
                          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all">
                            <div className="flex gap-3 flex-col sm:flex-row justify-between sm:items-center">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white font-extrabold font-mono tracking-wider text-sm px-2.5 py-1.5 rounded-lg shadow-sm">
                                  {item.number}
                                </span>
                                <div>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                                    ยอดแทงงวดนี้: ฿{item.totalSold.toLocaleString()} · อัตราจ่ายคูณ x{payouts.find(p => p.type === item.type)?.multiplier}
                                  </span>
                                </div>
                              </div>
                              <div className="sm:text-right">
                                <span className="text-[10px] text-slate-400 block">หากออกเลขนี้ จะต้องเคลมจ่ายสูงสุด</span>
                                <span className={`text-sm font-extrabold font-mono ${isHighRisk ? 'text-red-500' : 'text-slate-800'}`}>
                                  ฿{item.totalLiability.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Custom progress level showing danger */}
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shrink-0 mt-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${safetyPercent}%` }}
                                transition={{ duration: 0.6 }}
                                className={`h-full rounded-full ${
                                  isHighRisk 
                                    ? 'bg-red-500' 
                                    : 'bg-blue-600'
                                }`}
                              ></motion.div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                              <span>จำกัดเพดานพอร์ตปลอดภัย ฿100,000</span>
                              {isHighRisk && <span className="text-red-500 font-bold flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> ควรพิจารณาจำกัดยอดหรือตั้งเป็นเลขอั้นด่วน</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Profit-Loss Timeline Chart */}
                  <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider">
                      กราฟแนวโน้มยอดขายและประวัติรอบที่ผ่านมา (Monthly Sales Growth Timeline)
                    </h4>
                    <div className="flex items-end gap-2.5 h-[160px] border-b border-l border-slate-200 pl-3.5 pb-2">
                      {Object.entries(dailySales).map(([date, sales], idx) => {
                        const scale = totalSalesHistorical > 0 ? (sales / totalSalesHistorical) * 120 : 50;
                        const barHeight = Math.max(scale, 10);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-1 bg-slate-900 text-white border border-slate-800 text-[10px] rounded-lg px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap font-mono font-bold">
                              ฿{sales.toLocaleString()}
                            </div>
                            <div 
                              style={{ height: `${barHeight}px` }} 
                              className="w-full bg-blue-600/80 hover:bg-blue-600 rounded-t-md transition-all"
                            />
                            <span className="text-[10px] text-slate-400 truncate mt-1.5 font-sans font-medium tracking-tighter w-full text-center">
                              {date}
                            </span>
                          </div>
                        );
                      })}
                      {Object.keys(dailySales).length === 0 && (
                        <div className="w-full text-center text-slate-400 text-xs py-10">ยังไม่พบคงยอดข้อมูลขายตามวัน</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top selling numbers list */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Realtime 5 Best-selling Numbers */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-xs font-bold flex items-center gap-2 border-b border-slate-150 pb-3 mb-4 text-slate-800 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      5 อันดับเลขขายดี (Best Selling Numbers)
                    </h3>
                    <div className="space-y-3">
                      {topSellersList.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100/50 transition-all">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs bg-slate-200 text-slate-600 w-5 h-5 flex items-center justify-center rounded-full font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-slate-800 tracking-wider">
                              {item.number}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">{getPayoutLabel(item.type)}</span>
                            <span className="text-[11px] font-bold text-slate-900 font-mono">฿{item.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      {topSellersList.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-6 font-medium">ยังไม่มีการบันทึกรายการซื้อเข้ามา</p>
                      )}
                    </div>
                  </div>

                  {/* System configuration quick statuses */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white shadow-sm">
                    <h4 className="font-bold text-[10px] text-blue-400 block mb-3 tracking-widest uppercase font-sans">
                      นโยบายป้องกันความเสียหาย
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      เมื่อยอดเดิมพันใดๆ มีแนวโน้มชนเพดานที่ผู้ดูแลระบุไว้ ระบบหน้าร้านของฝั่งลูกค้าจะบล็อกตัวเลขดังกล่าวหรือปรับลดสิทธิ์โดยทันทีเพื่อค้ำประกันความเสถียรทางการเงินพอร์ต
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-sans">
                        <span className="text-slate-400 font-medium">จำกัดรับยอดสูงสุด:</span>
                        <span className="font-bold text-emerald-400">฿15,000 ต่อรอยเลข</span>
                      </div>
                      <div className="flex justify-between text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-sans">
                        <span className="text-slate-400 font-medium">จำนวนเลขควบคุมด่วน:</span>
                        <span className="font-bold text-yellow-400 font-mono">{limits.length} เลขอั้น</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* MANAGE NUMBER LIMITS TAB */}
          {activeTab === 'limits' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Add Limits Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
                  <Plus className="w-4 h-4 text-blue-600" />
                  เพิ่มข้อกำหนด อั้น/จำกัด ยอด
                </h3>

                <form onSubmit={handleAddLim} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">ประเภทสลาก</label>
                    <select
                      value={newLimType}
                      onChange={(e) => {
                        setNewLimType(e.target.value as LottoType);
                        setLimError('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-sans"
                    >
                      {payouts.map(p => (
                        <option key={p.type} value={p.type}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">
                        หมายเลข {newLimType === '3up' || newLimType === '3tod' ? '(3 หลัก)' : '(2 หลัก)'}
                      </label>
                      <input
                        type="text"
                        maxLength={newLimType === '3up' || newLimType === '3tod' ? 3 : 2}
                        value={newLimNumber}
                        onChange={(e) => {
                          setNewLimNumber(e.target.value.replace(/[^0-9]/g, ''));
                          setLimError('');
                        }}
                        placeholder={newLimType === '3up' || newLimType === '3tod' ? '924' : '65'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-bold font-mono tracking-widest text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">วงเงินที่ยอมรับรวม (บาท)</label>
                      <input
                        type="number"
                        min="1"
                        value={newLimMax || ''}
                        onChange={(e) => setNewLimMax(Number(e.target.value))}
                        placeholder="15000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold font-mono text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {limError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs rounded-xl flex items-center gap-1.5 font-medium">
                      <Info className="w-4 h-4 shrink-0 text-red-500" />
                      {limError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm text-xs uppercase"
                  >
                    บันทึกเป็นเลขอั้นในระบบ
                  </button>
                </form>
              </div>

              {/* Number List limits */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  รายการควบคุม ยอดแทงเลขอั้นประจำเป็นงวด
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5">ประเภท</th>
                        <th className="py-2.5 text-center">ตัวเลข</th>
                        <th className="py-2.5 text-right">วงเงินที่รับสูงสุด</th>
                        <th className="py-2.5 text-right">ยอดซื้อเฉลี่ยจริง</th>
                        <th className="py-2.5 text-right">เปอร์เซ็นต์เต็ม</th>
                        <th className="py-2.5 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {limits.map((l, idx) => {
                        const usagePct = Math.min((l.currentAmount / l.maxLimit) * 100, 100);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                                {getPayoutLabel(l.type)}
                              </span>
                            </td>
                            <td className="py-3 text-center font-bold text-sm text-slate-800 font-mono tracking-wider">
                              {l.number}
                            </td>
                            <td className="py-3 text-right font-bold text-slate-700 font-mono">
                              ฿{l.maxLimit.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-bold text-slate-700 font-mono">
                              ฿{l.currentAmount.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-mono">
                              <span className={`font-bold text-[10px] ${usagePct >= 80 ? 'text-red-500' : 'text-blue-600'}`}>
                                {usagePct.toFixed(0)}% เต็ม
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => onRemoveLimit(l.number, l.type)}
                                className="text-red-500 hover:text-red-700 transition-all cursor-pointer p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {limits.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">ยังไม่มีข้อมูลรายการเลขอั้นนำเข้าระบบ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ADJUST PAYOUTS MULTIPLIERS TAB */}
          {activeTab === 'payouts' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-2xl mx-auto shadow-sm">
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-blue-600" />
                ปรับปรุงตั้งค่าราคาจ่ายต่อบาท (Payout Setup)
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">เมื่อแก้ไขอัตราจะมีผลกับคุณในบิลใหม่ที่ลูกค้าแจ้งส่งเข้ามาเท่านั้น</p>

              {payoutFeedbacks && (
                <div className="mb-4 p-3.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  {payoutFeedbacks}
                </div>
              )}

              <div className="space-y-4">
                {payouts.map((pay) => (
                  <div key={pay.type} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block uppercase">{pay.label}</span>
                      <span className="text-[10px] text-slate-500 block font-mono mt-0.5">รหัสสลาก: {pay.type} (อัตราเดิมพันคูณ {pay.multiplier})</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono font-bold">฿</span>
                        <input
                          type="number"
                          value={payoutInputs[pay.type] || ''}
                          onChange={(e) => setPayoutInputs({ ...payoutInputs, [pay.type]: Number(e.target.value) })}
                          className="w-[120px] bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 text-xs text-right font-bold text-slate-800 font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdatePayoutRate(pay.type)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        อัปเดตอัตรา
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPROVE DEPOSITS & WITHDRAWALS TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                คำขอดำเนินการธุรกรรมฝากและถอน (Pending Operations)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">บิลธุรกรรม</th>
                      <th className="py-3 px-4">ชื่อผู้ทำรายการ</th>
                      <th className="py-3 px-4">เวลาและวันโอน</th>
                      <th className="py-3 px-4">ประเภทธุรกรรม</th>
                      <th className="py-3 px-4 text-right">จำนวนเงิน</th>
                      <th className="py-3 px-4">ข้อมูลบัญชี</th>
                      <th className="py-3 px-4 text-center">จัดการอนุมัติ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {transactions
                      .filter(t => t.status === 'pending')
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-mono text-slate-400">#{t.id}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{t.username}</td>
                          <td className="py-4 px-4 font-sans text-slate-500 font-medium">
                            {new Date(t.timestamp).toLocaleString('th-TH')}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase border ${
                              t.type === 'deposit' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              {t.type === 'deposit' ? 'ฝากเงิน (โอนสลิป)' : 'ถอนรางวัล'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                            ฿{t.amount.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            <div className="text-xs font-semibold">{t.bankName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.bankAccount}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onApproveTransaction(t.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                                title="กดอนุมัติธุรกรรมเงินเข้า/ออก"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <button
                                onClick={() => onRejectTransaction(t.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 transition-all cursor-pointer shadow-sm"
                                title="ปฏิเสธธรุกรรม"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    {transactions.filter(t => t.status === 'pending').length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          ไม่มีคำขอสลิปฝากหรือธุรกรรมถอนรออนุมัติในรอบบิลนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS / CUSTOMERS REPORT TAB */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-blue-600" />
                รายงานรายชื่อลูกค้า Siam Lotto Dashboard
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">รหัสสมาชิก</th>
                      <th className="py-3 px-4">ชื่อลููกค้า</th>
                      <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                      <th className="py-3 px-4 text-right">วงเงินคงเหลือ</th>
                      <th className="py-3 px-4">วันที่สมัคร</th>
                      <th className="py-3 px-4 text-center">สิทธิ์สถานะ</th>
                      <th className="py-3 px-4 text-center">เติมเงินระบบทดลอง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {users
                      .filter(user => user.role === 'customer')
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-mono text-slate-400">#{u.id}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{u.username}</td>
                          <td className="py-4 px-4 font-mono text-slate-500">{u.phone}</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                            ฿{u.balance.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-sans text-slate-500">
                            {new Date(u.registeredAt).toLocaleDateString('th-TH')}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => onToggleUserStatus(u.id)}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] cursor-pointer transition-all border ${
                                u.status === 'active'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                  : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {u.status === 'active' ? 'ปกติ (Active)' : 'ระงับ (Suspended)'}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                placeholder="+1,000"
                                onChange={(e) => setCreditInjections({ ...creditInjections, [u.id]: Number(e.target.value) })}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-bold text-slate-800 font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
                              />
                              <button
                                onClick={() => {
                                  const amt = creditInjections[u.id];
                                  if (amt && amt > 0) {
                                    onAddCredit(u.id, amt);
                                    setCreditInjections({ ...creditInjections, [u.id]: 0 });
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-sm transition-all cursor-pointer"
                              >
                                เพิ่มเงิน
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN DRAW LOTTERY TAB */}
          {activeTab === 'draw' && (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-xl mx-auto space-y-6 shadow-sm">
              <div className="text-center mb-4">
                <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-600 mb-2 border border-emerald-100">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">สุ่มและออกผลสลากรางวัลประจำรอบ</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mt-1 font-medium">
                  กกรอกหมายเลขรางวัลและยืนยันเพื่อตัดสินผลสลากรางวัลหาผู้ถูกตั๋ว ปรับลดวงเงิน ยอดเครดิต และปิดงวดชำระโดยอัตโนมัติ
                </p>
              </div>

              {drawSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-150 text-green-700 text-xs rounded-xl flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  {drawSuccess}
                </div>
              )}

              <form onSubmit={executeDraw} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">วันที่ประกาศรางวัล</label>
                  <input
                    type="date"
                    required
                    value={drawDate}
                    onChange={(e) => setDrawDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 tracking-wider font-mono text-center text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1 text-center">รางวัลที่ 1 (3 ตัวบน)</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="924"
                      value={draw3Up}
                      onChange={(e) => setDraw3Up(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl tracking-widest text-center font-extrabold text-blue-600 font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1 text-center">รางวัลเลขท้าย (2 ตัวล่าง)</label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      placeholder="65"
                      value={draw2Down}
                      onChange={(e) => setDraw2Down(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl tracking-widest text-center font-extrabold text-slate-700 font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5"
                    />
                  </div>
                </div>

                {drawError && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs rounded-xl font-medium">
                    {drawError}
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 font-sans font-medium text-slate-650">
                  <div className="text-slate-500 flex justify-between">
                    <span>ตารางประมวลผลรางวัล:</span>
                    <span className="text-slate-800 font-bold">2 ตัวบน = (จะคำนวณจาก 2 ตัวท้ายของ 3 ตัวบน)</span>
                  </div>
                  <div className="text-slate-500 flex justify-between items-center">
                    <span>3 ตัวโต๊ดของ {draw3Up || '???'} คือ: </span>
                    <span className="text-slate-800 text-right truncate max-w-[200px] font-bold font-mono">
                      {draw3Up.length === 3 ? Array.from(new Set([
                        draw3Up,
                        draw3Up[0]+draw3Up[2]+draw3Up[1],
                        draw3Up[1]+draw3Up[0]+draw3Up[2],
                        draw3Up[1]+draw3Up[2]+draw3Up[0],
                        draw3Up[2]+draw3Up[0]+draw3Up[1],
                        draw3Up[2]+draw3Up[1]+draw3Up[0]
                      ])).join(', ') : 'รอกรอก 3 ตัวบน'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const random3 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                      const random2 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                      setDraw3Up(random3);
                      setDraw2Down(random2);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3.5 rounded-xl text-xs transition-all cursor-pointer border border-slate-200 shadow-sm uppercase tracking-wider"
                  >
                    สุ่มเลขเดนงดเร็ว
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/10 text-xs uppercase tracking-wider"
                  >
                    <Award className="w-4 h-4" />
                    ยืนยันออกผลจับรางวัล & ปรับเครดิต
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
