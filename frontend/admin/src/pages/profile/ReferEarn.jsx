import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { 
  Copy, CheckCircle2, Wallet, Users, Gift, Share2, 
  ArrowRight, Sparkles, TrendingUp, History, Send
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ReferEarn() {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://dcneetcounselling.com/?ref=${referralToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareText = encodeURIComponent(
    `🎓 Get 10% OFF on NEET counselling plans using my referral link:\n${referralLink}`
  );
  
  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎓 Get 10% OFF on NEET counselling plans using my referral link!')}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Refer & Earn</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Share the benefits with friends and earn rewards.</p>
          </motion.div>

          {/* SECTION 1 - HERO REFERRAL CARD */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-1"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-[22px] p-6 sm:p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay animate-pulse-slow"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-white">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-medium mb-4 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Premium Rewards</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                    Invite Friends & <br className="hidden md:block" /> Earn Rewards
                  </h2>
                  <p className="text-lg text-purple-100 mb-8 max-w-lg">
                    Your friend gets <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">10% OFF</span> and you earn <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">10% cashback</span> in your wallet after their successful purchase.
                  </p>

                  {/* Link Box */}
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={referralLink}
                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 pl-4 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                      />
                      <button 
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Copy Link"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5 text-white/80" />}
                      </button>
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#25D366]/30"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.571-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      WhatsApp
                    </a>
                    <a 
                      href={telegramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#0088cc] hover:bg-[#007ab8] text-white px-5 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#0088cc]/30"
                    >
                      <Send className="w-5 h-5" />
                      Telegram
                    </a>
                  </div>
                </div>
                
                {/* Decorative Graphic */}
                <div className="hidden lg:block flex-shrink-0 relative">
                  <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
                    <Gift className="w-24 h-24 text-white drop-shadow-lg" />
                  </div>
                  {/* Floating elements */}
                  <motion.div 
                    animate={{ y: [-10, 10, -10] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg"
                  >
                    <Wallet className="w-6 h-6 text-yellow-900" />
                  </motion.div>
                  <motion.div 
                    animate={{ y: [10, -10, 10] }} 
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute -bottom-2 -left-4 bg-purple-300 rounded-full p-3 shadow-lg"
                  >
                    <Users className="w-6 h-6 text-purple-900" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SECTION 2 - WALLET OVERVIEW */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<Wallet className="w-6 h-6 text-indigo-500" />}
              title="Wallet Balance"
              value={`₹${stats.wallet}`}
              bgClass="bg-indigo-50 dark:bg-indigo-950/30"
              iconBg="bg-indigo-100 dark:bg-indigo-900/50"
            />
            <StatCard 
              icon={<Users className="w-6 h-6 text-emerald-500" />}
              title="Successful Referrals"
              value={stats.successful.toString()}
              bgClass="bg-emerald-50 dark:bg-emerald-950/30"
              iconBg="bg-emerald-100 dark:bg-emerald-900/50"
            />
            <StatCard 
              icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
              title="Cashback Earned"
              value={`₹${stats.wallet}`}
              bgClass="bg-amber-50 dark:bg-amber-950/30"
              iconBg="bg-amber-100 dark:bg-amber-900/50"
            />
          </motion.div>

          {/* SECTION 3 - HOW IT WORKS */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Share2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">How It Works</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-0.5 bg-gradient-to-r from-indigo-100 via-purple-200 to-fuchsia-100 dark:from-indigo-900 dark:via-purple-800 dark:to-fuchsia-900 z-0"></div>
              
              <StepCard step="1" title="Share Link" desc="Send your unique referral link to friends." icon={<Share2 className="w-5 h-5" />} />
              <StepCard step="2" title="Friend Joins" desc="They sign up and purchase a plan." icon={<Users className="w-5 h-5" />} />
              <StepCard step="3" title="Friend Gets 10% OFF" desc="Discount applied automatically." icon={<Gift className="w-5 h-5" />} />
              <StepCard step="4" title="You Get Cashback" desc="10% cashback added to your wallet." icon={<Wallet className="w-5 h-5" />} />
            </div>
          </motion.div>

          {/* SECTION 4 - REFERRAL HISTORY */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <History className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Referral History</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                    <th className="py-4 px-4 font-semibold">Student Name</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold text-right">Cashback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  <HistoryRow name="Rahul Sharma" status="Purchased" amount="₹199" type="success" />
                  <HistoryRow name="Priya Patel" status="Joined" amount="Pending" type="pending" />
                  <HistoryRow name="Aman Singh" status="Purchased" amount="₹299" type="success" />
                </tbody>
              </table>
            </div>
            {/* Empty state / View All could go here */}
          </motion.div>

          {/* SECTION 5 - MOTIVATIONAL CTA */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="relative rounded-3xl p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-xl"></div>
            <div className="relative bg-white dark:bg-slate-950 rounded-[22px] p-8 md:p-12 text-center shadow-xl">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Refer more friends and reduce your counselling costs using wallet rewards.
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  There is no limit to how much you can earn. Start sharing your link today!
                </p>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Share Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* MOBILE STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden z-50">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-5 py-3.5 rounded-xl font-bold shadow-lg"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}

// Subcomponents
function StatCard({ icon, title, value, bgClass, iconBg }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5"
    >
      <div className={cn("p-4 rounded-2xl", iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function StepCard({ step, title, desc, icon }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center group">
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300">
        <div className="absolute -top-3 -right-3 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
          {step}
        </div>
        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[180px]">{desc}</p>
    </div>
  );
}

function HistoryRow({ name, status, amount, type }) {
  const isSuccess = type === 'success';
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {name.charAt(0)}
          </div>
          <span className="font-medium text-slate-900 dark:text-white">{name}</span>
        </div>
      </td>
      <td className="py-5 px-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
          isSuccess 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", isSuccess ? "bg-green-500" : "bg-amber-500")}></span>
          {status}
        </span>
      </td>
      <td className="py-5 px-4 text-right">
        <span className={cn(
          "font-bold",
          isSuccess ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
        )}>
          {isSuccess ? '+' : ''}{amount}
        </span>
      </td>
    </tr>
  );
}
