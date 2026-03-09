"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, FileText } from "lucide-react"

type OperationLog = {
  id: string
  date: string
  time: string
  studentName: string
  category: string
  content: string
  response: string
  status: '진행중' | '완료'
  branch: string
}

export default function OperationsPage() {
  const { currentBranch, students } = useDashboard()
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [isAdding, setIsAdding] = useState(false)

  // New Log Form
  const [newLog, setNewLog] = useState<Partial<OperationLog>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    studentName: '',
    category: '기타',
    content: '',
    response: '',
    status: '진행중'
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jstudy_operations')
    if (saved) {
      setLogs(JSON.parse(saved))
    } else {
      setLogs([
        { id: '1', date: filterDate, time: '09:00', studentName: '박하원', category: '지각', content: '09:00까지 등원 확인하여 미등원 시 연락', response: '학부모님 통화 완료', status: '완료', branch: currentBranch },
        { id: '2', date: filterDate, time: '14:30', studentName: '장혜민', category: '지각', content: '사유 : 차 막힘', response: '벌점 시트 기입', status: '완료', branch: currentBranch },
        { id: '3', date: filterDate, time: '16:00', studentName: '박지혜', category: '기타', content: '복도 청소, 종이·캔 분리수거', response: '', status: '완료', branch: currentBranch }
      ])
    }
  }, [])

  // Save to localStorage when logs change
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('jstudy_operations', JSON.stringify(logs))
    }
  }, [logs])

  const filteredLogs = logs.filter(log => log.branch === currentBranch && log.date === filterDate)

  const handleAddSubmit = () => {
    if (!newLog.content) return alert("내용을 입력해주세요.")
    
    const logEntry: OperationLog = {
      id: Date.now().toString(),
      date: newLog.date || filterDate,
      time: newLog.time || '',
      studentName: newLog.studentName || '',
      category: newLog.category || '기타',
      content: newLog.content || '',
      response: newLog.response || '',
      status: newLog.status as '진행중' | '완료',
      branch: currentBranch
    }
    
    setLogs([logEntry, ...logs])
    setIsAdding(false)
    setNewLog({
      date: filterDate,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      studentName: '',
      category: '기타',
      content: '',
      response: '',
      status: '진행중'
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('삭제하시겠습니까?')) {
      setLogs(logs.filter(log => log.id !== id))
    }
  }

  const handleUpdate = (id: string, field: keyof OperationLog, value: string) => {
    setLogs(logs.map(log => log.id === id ? { ...log, [field]: value } : log))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold mb-2 uppercase tracking-widest border border-rose-100">
            <FileText size={12} /> Operation Report
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">특이사항 보고서 ({currentBranch})</h1>
          <p className="text-sm text-slate-500 font-medium">관리자 전용 특이사항 및 학생 이슈를 기록하고 대응 여부를 체크합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-40 font-bold bg-slate-50"
          />
          <Button onClick={() => setIsAdding(true)} className="bg-slate-800 text-white hover:bg-slate-900 shadow-md">
            <Plus size={16} className="mr-2" /> 새 항목 추가
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead className="w-[100px] font-bold text-slate-700 text-center">시간</TableHead>
              <TableHead className="w-[120px] font-bold text-slate-700">이름</TableHead>
              <TableHead className="w-[100px] font-bold text-slate-700">구분</TableHead>
              <TableHead className="min-w-[200px] font-bold text-slate-700">특이사항 내용</TableHead>
              <TableHead className="min-w-[200px] font-bold text-slate-700">대응 및 처리</TableHead>
              <TableHead className="w-[100px] font-bold text-slate-700 text-center">처리여부</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-blue-50/50">
                <TableCell>
                  <Input type="time" value={newLog.time} onChange={e => setNewLog({...newLog, time: e.target.value})} className="h-8 text-xs" />
                </TableCell>
                <TableCell>
                  <Input placeholder="이름" value={newLog.studentName} onChange={e => setNewLog({...newLog, studentName: e.target.value})} className="h-8 text-xs" />
                </TableCell>
                <TableCell>
                  <Select value={newLog.category || "기타"} onValueChange={(val) => setNewLog({...newLog, category: val || "기타"})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="지각">지각</SelectItem>
                      <SelectItem value="결석">결석</SelectItem>
                      <SelectItem value="태도">태도불량</SelectItem>
                      <SelectItem value="상담">상담요청</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input placeholder="내용 입력..." value={newLog.content} onChange={e => setNewLog({...newLog, content: e.target.value})} className="h-8 text-xs" />
                </TableCell>
                <TableCell>
                  <Input placeholder="처리 내용..." value={newLog.response} onChange={e => setNewLog({...newLog, response: e.target.value})} className="h-8 text-xs" />
                </TableCell>
                <TableCell>
                  <Select value={newLog.status || "진행중"} onValueChange={(val) => setNewLog({...newLog, status: (val || "진행중") as any})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="진행중">진행중</SelectItem>
                      <SelectItem value="완료">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={handleAddSubmit} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"><Save size={16} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8 text-slate-400 hover:text-slate-600"><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filteredLogs.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-500 font-medium">해당 날짜에 기록된 특이사항이 없습니다.</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center">
                    <Input type="time" value={log.time} onChange={e => handleUpdate(log.id, 'time', e.target.value)} className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white" />
                  </TableCell>
                  <TableCell>
                    <Input value={log.studentName} onChange={e => handleUpdate(log.id, 'studentName', e.target.value)} className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white" />
                  </TableCell>
                  <TableCell>
                    <Select value={log.category} onValueChange={(val) => handleUpdate(log.id, 'category', val || "기타")}>
                      <SelectTrigger className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="지각">지각</SelectItem>
                        <SelectItem value="결석">결석</SelectItem>
                        <SelectItem value="태도">태도불량</SelectItem>
                        <SelectItem value="상담">상담요청</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input value={log.content} onChange={e => handleUpdate(log.id, 'content', e.target.value)} className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white" />
                  </TableCell>
                  <TableCell>
                    <Input value={log.response} onChange={e => handleUpdate(log.id, 'response', e.target.value)} className="h-8 text-xs bg-transparent border-transparent hover:border-slate-200 focus:bg-white placeholder:text-slate-300" placeholder="조치 내용 없음" />
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleUpdate(log.id, 'status', log.status === '완료' ? '진행중' : '완료')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${log.status === '완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {log.status}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(log.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}