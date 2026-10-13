"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Home, 
  BarChart2, 
  Settings, 
  Wallet, 
  User, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Bell
} from "lucide-react";

interface DashboardClientProps {
  students: any[];
  payments: any[];
  incomes: any[];
  expenses: any[];
  userName: string;
  currentMonth: number;
  currentYear: number;
}

export default function DashboardClient({
  students,
  payments,
  incomes,
  expenses,
  userName,
  currentMonth,
  currentYear,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("home");

  // হিসাব-নিকাশ
  const totalStudents = students.length;
  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netBalance = totalIncome - totalExpense;

  // বর্তমান মাসের পেমেন্ট হিসাব
  const currentMonthPayments = payments.filter(p => p.year === currentYear);
  const collectedFee = currentMonthPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      {/* মোবাইল ফ্রেম */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#1e3a8a] via-[#3b0764] to-[#4c1d95] text-white min-h-[850px] rounded-none sm:rounded-[48px] shadow-2xl flex flex-col relative overflow-hidden border-0 sm:border-8 border-slate-900">
        
        {/* টপ স্ট্যাটাস বার (মক) */}
        <div className="flex justify-between items-center px-6 pt-4 text-xs font-semibold text-blue-200/80">
          <span>9:41</span>
          <div className="flex items-center space-x-2">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-blue-200 rounded-sm flex items-center p-0.5">
              <div className="h-full w-3 bg-blue-200 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* হেডার */}
        <div className="flex items-center justify-between px-6 py-4">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold tracking-wide">Data Analytics</h1>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Bell className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* সাব-হেডার স্ট্যাটস কার্ড */}
        <div className="px-6 mb-4 flex gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-200/70">Active Students</p>
              <p className="text-xl font-extrabold text-cyan-300">{totalStudents}</p>
            </div>
            <Users className="w-6 h-6 text-cyan-400 opacity-80" />
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-200/70">Collection Rate</p>
              <p className="text-xl font-extrabold text-pink-400">
                {totalIncome > 0 ? ((collectedFee / totalIncome) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-pink-400 opacity-80" />
          </div>
        </div>

        {/* স্ক্রোলএবল কনটেন্ট */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-24 scrollbar-none">
          
          {/* কার্ড ১: লাইন চার্ট (Income vs Expenses Trend) */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-lg relative">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-blue-200">Financial Overview</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                Month {currentMonth}
              </span>
            </div>

            {/* মক লাইন চার্ট গ্রাফ */}
            <div className="h-28 relative flex items-end pt-4">
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* ব্যাকগ্রাউন্ড এরিয়া ফিল */}
                <path d="M 0 70 Q 75 30 150 50 T 300 20 L 300 100 L 0 100 Z" fill="url(#cyanGradient)" />
                {/* লাইন ১ (Income) */}
                <path d="M 0 70 Q 75 30 150 50 T 300 20" fill="none" stroke="#22d3ee" strokeWidth="3" />
                {/* লাইন ২ (Expense) */}
                <path d="M 0 90 Q 75 60 150 40 T 300 50" fill="none" stroke="#f472b6" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* কার্ড ২: ডোনাট চার্ট ও বার চার্ট */}
          <div className="grid grid-cols-2 gap-4">
            {/* ডোনাট চার্ট */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col items-center justify-center relative">
              <span className="text-[11px] font-medium text-blue-200 mb-2 self-start">Statistics</span>
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-pink-400 border-t-cyan-400 border-r-purple-500">
                <div className="absolute text-[10px] font-bold text-center">
                  ৳{totalIncome}
                </div>
              </div>
              <div className="flex gap-2 mt-3 text-[9px] text-blue-200">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>In</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>Out</span>
              </div>
            </div>

            {/* বার চার্ট */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-blue-200">Weekly Flow</span>
              <div className="h-20 flex items-end justify-between gap-1.5 pt-2">
                <div className="w-2 bg-cyan-400 rounded-t-sm h-[60%]"></div>
                <div className="w-2 bg-pink-400 rounded-t-sm h-[80%]"></div>
                <div className="w-2 bg-indigo-400 rounded-t-sm h-[40%]"></div>
                <div className="w-2 bg-cyan-300 rounded-t-sm h-[90%]"></div>
                <div className="w-2 bg-pink-300 rounded-t-sm h-[50%]"></div>
              </div>
            </div>
          </div>

          {/* কার্ড ৩: টোটাল ইনকাম ও নেট ব্যালেন্স সারাংশ */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-200">Net Balance ({userName})</p>
              <p className="text-2xl font-black text-white mt-1">৳{netBalance}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>

        </div>

        {/* বটম নেভিগেশন বার */}
        <div className="absolute bottom-3 left-4 right-4 bg-purple-950/80 backdrop-blur-2xl border border-white/15 rounded-3xl py-3 px-6 flex justify-between items-center shadow-2xl">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center transition ${activeTab === "home" ? "text-cyan-400 scale-110" : "text-blue-200/60"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center transition ${activeTab === "stats" ? "text-cyan-400 scale-110" : "text-blue-200/60"}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[9px] mt-1">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab("wallet")}
            className={`flex flex-col items-center transition ${activeTab === "wallet" ? "text-cyan-400 scale-110" : "text-blue-200/60"}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] mt-1">Wallet</span>
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center transition ${activeTab === "settings" ? "text-cyan-400 scale-110" : "text-blue-200/60"}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] mt-1">Settings</span>
          </button>

          <button 
            onClick={() => setActiveTab("user")}
            className={`flex flex-col items-center transition ${activeTab === "user" ? "text-cyan-400 scale-110" : "text-blue-200/60"}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] mt-1">Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
