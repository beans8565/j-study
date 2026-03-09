"use client"

import { useState, useEffect } from "react"
import { Search, Bell, Clock, MapPin } from "lucide-react"
import { useDashboard, Branch } from "@/components/providers/DashboardProvider"

export default function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState("")
  const { currentBranch, setCurrentBranch } = useDashboard()

  useEffect(() => {
    const today = new Date()
    const days = ['일', '월', '화', '수', '목', '금', '토']
    setCurrentDate(`${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')} (${days[today.getDay()]})`)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">통합 대시보드</h2>
        
        {/* 지점 선택기 */}
        <div className="relative flex items-center ml-2">
          <select 
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value as Branch)}
            className="appearance-none bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-colors"
          >
            <option value="사우점">📍 사우점</option>
            <option value="목동점">📍 목동점</option>
          </select>
        </div>

        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-100 flex items-center gap-1.5">
          <Clock size={12} /> <span>{currentDate}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="학생 통합 검색..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors w-64 shadow-inner"
          />
        </div>
        <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  )
}