"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckSquare, Square, Plus, Trash2 } from "lucide-react"

type Task = {
  id: string
  date: string // YYYY-MM-DD
  content: string
  isCompleted: boolean
  branch: string
}

export default function SchedulePage() {
  const { currentBranch } = useDashboard()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('jstudy_schedule')
    if (saved) {
      setTasks(JSON.parse(saved))
    } else {
      const today = new Date().toISOString().split('T')[0]
      setTasks([
        { id: '1', date: today, content: '천정민(S) 계획표 작성', isCompleted: true, branch: currentBranch },
        { id: '2', date: today, content: '박하원(S) 특이사항 확인', isCompleted: false, branch: currentBranch },
        { id: '3', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], content: '모의고사 성적표 취합', isCompleted: false, branch: currentBranch }
      ])
    }
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('jstudy_schedule', JSON.stringify(tasks))
    }
  }, [tasks])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleAddTask = () => {
    if (!newTaskText.trim() || !selectedDate) return
    const newTask: Task = {
      id: Date.now().toString(),
      date: selectedDate,
      content: newTaskText.trim(),
      isCompleted: false,
      branch: currentBranch
    }
    setTasks([...tasks, newTask])
    setNewTaskText("")
  }

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/50 border border-slate-100 p-2"></div>)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayTasks = tasks.filter(t => t.branch === currentBranch && t.date === dateStr)
    const isToday = dateStr === new Date().toISOString().split('T')[0]
    
    days.push(
      <div 
        key={d} 
        className={`min-h-[120px] bg-white border ${isToday ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-slate-200'} p-3 hover:shadow-md transition-shadow group flex flex-col`}
        onClick={() => setSelectedDate(dateStr)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>
            {d}
          </span>
          <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">추가</span>
        </div>
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[100px] pr-1">
          {dayTasks.map(task => (
            <div key={task.id} className="flex items-start gap-1.5 group/task" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleToggleTask(task.id)} className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0">
                {task.isCompleted ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
              </button>
              <span className={`text-xs font-medium leading-snug flex-1 break-keep ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {task.content}
              </span>
              <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-red-500 shrink-0 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        {selectedDate === dateStr && (
          <div className="mt-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
            <input 
              autoFocus
              type="text" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="할일 입력 후 엔터"
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
        )}
      </div>
    )
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">월간 스케줄 관리</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{currentBranch}의 주요 학사 일정과 학생별 할 일을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-600 hover:bg-slate-100"><ChevronLeft size={20} /></Button>
          <h2 className="text-lg font-black text-slate-800 w-32 text-center">
            {year}년 {month + 1}월
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-600 hover:bg-slate-100"><ChevronRight size={20} /></Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map((day, i) => (
            <div key={day} className={`p-3 text-center text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px]">
          {days}
        </div>
      </div>
    </div>
  )
}