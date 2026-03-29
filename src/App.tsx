import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  LogOut, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronRight,
  Package,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  doc,
  setDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Reservation {
  id: string;
  uid: string;
  userName: string;
  pickupDate: string;
  address: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered';
  createdAt: any;
}

// --- Components ---

const Navbar = ({ user, onLogin, onLogout }: { user: FirebaseUser | null, onLogin: () => void, onLogout: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200">
    <div className="flex items-center gap-2">
      <span className="text-2xl font-serif font-semibold tracking-tight text-stone-900">WashPlan</span>
    </div>
    <div className="flex items-center gap-6">
      <a href="#services" className="hidden md:block text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">서비스 안내</a>
      <a href="#trust" className="hidden md:block text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">장인 정신</a>
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-stone-200" referrerPolicy="no-referrer" />
            <span className="hidden sm:block text-sm font-medium text-stone-900">{user.displayName}님</span>
          </div>
          <button onClick={onLogout} className="p-2 text-stone-500 hover:text-stone-900 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-full hover:bg-stone-800 transition-all shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          시작하기
        </button>
      )}
    </div>
  </nav>
);

const Hero = ({ onReserve }: { onReserve: () => void }) => (
  <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-white" />
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('https://picsum.photos/seed/laundry/1920/1080?blur=10')] bg-cover bg-center"
      />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-stone-500 uppercase bg-stone-100 rounded-full">
        Premium Laundry Experience
      </span>
      <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-stone-900 mb-8 leading-[1.1]">
        명품은 아무 데나 <br className="hidden sm:block" />
        맡기지 않습니다
      </h1>
      <p className="text-lg md:text-xl text-stone-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
        20년 장인의 손길, 집 앞에서 시작됩니다.<br />
        세탁의 기준을 바꾸다, <span className="font-serif italic">WashPlan</span>
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={onReserve}
          className="group flex items-center gap-3 px-8 py-4 text-lg font-medium text-white bg-stone-900 rounded-full hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl active:scale-95"
        >
          <Package className="w-6 h-6" />
          📦 프리미엄 수거 예약하기
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 text-lg font-medium text-stone-900 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-all"
        >
          서비스 더 알아보기
        </button>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400"
    >
      <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to explore</span>
      <div className="w-px h-12 bg-gradient-to-b from-stone-300 to-transparent" />
    </motion.div>
  </section>
);

const TrustSection = () => (
  <section id="trust" className="py-32 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://picsum.photos/seed/craftsman/800/1000" 
              alt="Artisan at work" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -bottom-10 -right-10 hidden xl:block w-64 p-8 bg-stone-900 text-white rounded-2xl shadow-2xl">
            <span className="text-4xl font-serif italic block mb-2">20+</span>
            <span className="text-xs uppercase tracking-widest opacity-60">Years of Experience</span>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6 leading-tight">
              한 벌, 한 벌 <br />
              섬세하게 관리합니다
            </h2>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              20년 세탁 경력의 정교한 케어로 당신의 소중한 의류를 최상의 상태로 되돌립니다. 
              명품 의류에 맞는 맞춤 세탁 솔루션을 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-stone-900">정교한 케어</h3>
              <p className="text-sm text-stone-500 leading-relaxed">미세한 오염까지 놓치지 않는 장인의 눈길로 관리합니다.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-900">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-stone-900">여유 있는 일상</h3>
              <p className="text-sm text-stone-500 leading-relaxed">무거운 세탁물은 저희에게 맡기고 당신의 시간을 즐기세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ReservationModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: FirebaseUser | null }) => {
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'reservations'), {
        uid: user.uid,
        userName: user.displayName,
        pickupDate: date,
        address,
        phone,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      onClose();
      alert('예약이 완료되었습니다. 장인이 곧 확인하겠습니다.');
    } catch (err) {
      console.error(err);
      alert('예약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-xl font-serif font-medium text-stone-900">프리미엄 수거 예약</h2>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">수거 희망 날짜</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">수거 주소</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="상세 주소를 입력해주세요"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">연락처</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    type="tel" 
                    placeholder="010-0000-0000"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium shadow-lg hover:bg-stone-800 transition-all disabled:opacity-50"
              >
                {loading ? '예약 중...' : '🗓 원하는 날짜로 예약하기'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ReservationList = ({ reservations }: { reservations: Reservation[] }) => (
  <section className="py-20 px-6 bg-stone-50">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-serif font-medium text-stone-900">나의 예약 현황</h2>
        <span className="text-sm text-stone-500">{reservations.length}건의 요청</span>
      </div>

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-100">
            <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400">아직 예약 내역이 없습니다.</p>
          </div>
        ) : (
          reservations.map((res) => (
            <motion.div 
              key={res.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-stone-900">{res.pickupDate} 수거 예정</span>
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold",
                      res.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {res.status === 'pending' ? '대기중' : '진행중'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate max-w-[200px]">{res.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Clock className="w-3 h-3" />
                {res.createdAt?.toDate().toLocaleDateString()} 신청됨
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  </section>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Sync user profile
        const userRef = doc(db, 'users', u.uid);
        setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          role: 'user',
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Listen for reservations
        const q = query(
          collection(db, 'reservations'), 
          where('uid', '==', u.uid),
          orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
          const res = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
          setReservations(res);
        });
      } else {
        setReservations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleReserveClick = () => {
    if (!user) {
      handleLogin();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen selection:bg-stone-900 selection:text-white">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main>
        <Hero onReserve={handleReserveClick} />
        
        <section id="services" className="py-32 px-6 bg-stone-50">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 block">Our Services</span>
            <h2 className="text-4xl font-serif font-light text-stone-900 mb-6">당신의 일상에 여유를 더합니다</h2>
            <p className="text-stone-500 max-w-2xl mx-auto font-light">
              무거운 세탁물, 이제 들고 다니지 마세요. 문 앞에 두면 최상의 상태로 돌아옵니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { title: '프리미엄 수거', desc: '원하는 시간에 문 앞까지 찾아갑니다.', icon: Truck },
              { title: '장인 케어', desc: '20년 경력의 전문가가 직접 관리합니다.', icon: ShieldCheck },
              { title: '안심 배송', desc: '세탁 후 최상의 상태로 안전하게 배송합니다.', icon: CheckCircle2 },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-900 mb-8 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-medium text-stone-900 mb-4">{item.title}</h3>
                <p className="text-stone-500 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <TrustSection />

        {user && <ReservationList reservations={reservations} />}

        <section className="py-32 px-6 bg-stone-900 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-8 leading-tight">
              고객이 다시 찾는 이유, <br />
              결과로 증명합니다
            </h2>
            <p className="text-stone-400 text-lg mb-12 font-light">
              한 번의 경험이 기준이 됩니다. 지금 바로 프리미엄 케어를 시작하세요.
            </p>
            <button 
              onClick={handleReserveClick}
              className="px-10 py-5 text-lg font-medium bg-white text-stone-900 rounded-full hover:bg-stone-100 transition-all shadow-xl"
            >
              🚚 수거 서비스 신청하기
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-serif font-semibold text-stone-900">WashPlan</span>
            <p className="text-xs text-stone-400">© 2026 WashPlan. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-xs font-medium text-stone-500">
            <a href="#" className="hover:text-stone-900 transition-colors">이용약관</a>
            <a href="#" className="hover:text-stone-900 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-stone-900 transition-colors">고객센터</a>
          </div>
        </div>
      </footer>

      <ReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user}
      />
    </div>
  );
}
