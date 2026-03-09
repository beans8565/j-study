"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { AlertTriangle, Ticket, History, Search, ChevronRight, X, Trash2, FileText, Settings, Plus } from "lucide-react"

export default function DemeritPage() {
  const { students, setStudents, currentBranch } = useDashboard()
  const branchStudents = students.filter(s => s.branch === currentBranch && s.enrollmentStatus === '재원')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  
  // Rules management
  const [rules, setRules] = useState<any[]>([])
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [newRule, setNewRule] = useState({ name: '', demerit: 0, rest: 0 })

  // Individual Student Management Modal
  const [activeTab, setActiveTab] = useState<'rule'|'demerit'|'rest'>('rule')
  const [actionType, setActionType] = useState<'add'|'use'|'deduct'>('add')
  const [amount, setAmount] = useState<number>(1)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState('')

  useEffect(() => {
    const savedRules = localStorage.getItem('jstudy_rules')
    if (savedRules) {
      setRules(JSON.parse(savedRules))
    } else {
      const defaultRules = [
        { id: 'r1', name: '지각(1~4분)', demerit: 1, rest: 0 },
        { id: 'r2', name: '지각(5~29분)', demerit: 2, rest: -1 },
        { id: 'r3', name: '지각(30분이상)', demerit: 3, rest: -2 },
        { id: 'r4', name: '과제 미제출', demerit: 5, rest: 0 },
        { id: 'r5', name: '휴식권 사용 (정규교시)', demerit: 0, rest: -1 },
      ]
      setRules(defaultRules)
      localStorage.setItem('jstudy_rules', JSON.stringify(defaultRules))
    }
  }, [])

  const saveRules = (newRules: any[]) => {
    setRules(newRules)
    localStorage.setItem('jstudy_rules', JSON.stringify(newRules))
  }

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRule.name) return
    const added = [...rules, { id: 'r'+Date.now(), name: newRule.name, demerit: Number(newRule.demerit), rest: Number(newRule.rest) }]
    saveRules(added)
    setNewRule({ name: '', demerit: 0, rest: 0 })
    setIsRuleModalOpen(false)
  }

  const handleDeleteRule = (id: string) => {
    if(confirm('규정을 삭제하시겠습니까?')) {
      saveRules(rules.filter(r => r.id !== id))
    }
  }

  const filteredStudents = branchStudents.filter(s => 
    s.name.includes(searchTerm) || s.grade.includes(searchTerm)
  )

  const stats = {
    totalDemerits: branchStudents.reduce((acc, curr) => acc + (curr.penaltyPoints || 0), 0),
    riskStudents: branchStudents.filter(s => (s.penaltyPoints || 0) >= 10).length,
    totalPasses: branchStudents.reduce((acc, curr) => acc + (curr.restTickets || 0), 0)
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    let effectDemerit = 0
    let effectRest = 0
    let finalReason = reason
    let finalNote = note

    if (activeTab === 'rule') {
      const rule = rules.find(r => r.id === selectedRuleId)
      if (!rule) return
      effectDemerit = rule.demerit
      effectRest = rule.rest
      finalReason = rule.name
      finalNote = `[규정 자동 적용]\n벌점 ${rule.demerit > 0 ? '+'+rule.demerit : rule.demerit}, 휴식권 ${rule.rest > 0 ? '+'+rule.rest : rule.rest}\n${note}`
    } else if (activeTab === 'demerit') {
      effectDemerit = actionType === 'add' ? amount : -amount
      if (!finalReason) finalReason = actionType === 'add' ? '벌점 부여' : '벌점 차감'
    } else if (activeTab === 'rest') {
      effectRest = actionType === 'add' ? amount : -amount
      if (!finalReason) finalReason = actionType === 'add' ? '휴식권 부여' : '휴식권 사용'
    }

    const newHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: activeTab,
      reason: finalReason,
      effectDemerit,
      effectRest,
      note: finalNote
    }

    setStudents(students.map(s => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          penaltyPoints: Math.max(0, (s.penaltyPoints || 0) + effectDemerit),
          restTickets: (s.restTickets || 0) + effectRest,
          demeritHistory: [newHistory, ...(s.demeritHistory || [])]
        }
      }
      return s
    }))

    setAmount(1)
    setNote('')
    setReason('')
  }

  const handleDeleteHistory = (historyId: string) => {
    if (!selectedStudent || !confirm('해당 기록을 삭제하고 점수를 원복하시겠습니까?')) return

    const record = selectedStudent.demeritHistory?.find(h => h.id === historyId)
    if (!record) return

    setStudents(students.map(s => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          penaltyPoints: Math.max(0, (s.penaltyPoints || 0) - record.effectDemerit),
          restTickets: (s.restTickets || 0) - record.effectRest,
          demeritHistory: s.demeritHistory?.filter(h => h.id !== historyId)
        }
      }
      return s
    }))
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">벌점 및 휴식권 관리</h1>
          <p className="text-slate-500 mt-1 font-medium">{currentBranch} 학생들의 벌점과 휴식권을 관리하고 규정을 설정합니다.</p>
        </div>
        <button onClick={() => setIsRuleModalOpen(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors flex items-center">
          <Settings size={16} className="mr-2" /> 규정 관리
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-0.5">위험군 학생 (10점 이상)</p>
            <p className="text-2xl font-black text-red-600">{stats.riskStudents}명</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><History size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-0.5">전체 누적 벌점</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalDemerits}점</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Ticket size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-0.5">잔여 휴식권 총합</p>
            <p className="text-2xl font-black text-green-600">{stats.totalPasses}장</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center"><Ticket size={18} className="mr-2 text-slate-500" /> 학생 목록</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="이름 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">이름</th>
              <th className="p-4">학년</th>
              <th className="p-4">누적 벌점</th>
              <th className="p-4">보유 휴식권</th>
              <th className="p-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">{student.name}</td>
                <td className="p-4 text-slate-600">{student.grade}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black ${(student.penaltyPoints || 0) >= 10 ? 'bg-red-100 text-red-700' : (student.penaltyPoints || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                    {student.penaltyPoints || 0}점
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black ${(student.restTickets || 0) > 0 ? 'bg-green-100 text-green-700' : (student.restTickets || 0) < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {student.restTickets || 0}장
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setSelectedStudentId(student.id); setActiveTab('rule'); }} className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition-colors shadow-sm">
                    기록 관리 <ChevronRight size={14} className="ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rules Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800 flex items-center"><Settings size={20} className="mr-2 text-slate-600" /> 벌점 및 휴식권 규정 설정</h2>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <form onSubmit={handleAddRule} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-600 mb-1">규정명</label>
                  <input required value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} placeholder="예: 무단 지각" className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-slate-600 mb-1">벌점 증감</label>
                  <input required type="number" value={newRule.demerit} onChange={e => setNewRule({...newRule, demerit: Number(e.target.value)})} placeholder="+/-" className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-center font-bold text-red-600" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-slate-600 mb-1">휴식권 증감</label>
                  <input required type="number" value={newRule.rest} onChange={e => setNewRule({...newRule, rest: Number(e.target.value)})} placeholder="+/-" className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-center font-bold text-blue-600" />
                </div>
                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded font-bold hover:bg-slate-900 h-[38px] w-full md:w-auto">추가</button>
              </form>

              <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">규정명</th>
                    <th className="p-3 text-center">벌점</th>
                    <th className="p-3 text-center">휴식권</th>
                    <th className="p-3 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 font-bold">{rule.name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${rule.demerit > 0 ? 'bg-red-100 text-red-700' : rule.demerit < 0 ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>
                          {rule.demerit > 0 ? '+'+rule.demerit : rule.demerit}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${rule.rest > 0 ? 'bg-green-100 text-green-700' : rule.rest < 0 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                          {rule.rest > 0 ? '+'+rule.rest : rule.rest}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteRule(rule.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Left: Form */}
            <div className="w-full md:w-1/2 flex flex-col border-r border-slate-200 bg-white">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl text-slate-800">{selectedStudent.name} <span className="text-sm font-medium text-slate-500 ml-1">{selectedStudent.grade}</span></h3>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded">벌점 {selectedStudent.penaltyPoints || 0}점</span>
                    <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded">휴식권 {selectedStudent.restTickets || 0}장</span>
                  </div>
                </div>
                <button onClick={() => setSelectedStudentId(null)} className="md:hidden text-slate-400 hover:text-slate-800"><X size={24}/></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setActiveTab('rule')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'rule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>규정 적용</button>
                  <button onClick={() => setActiveTab('demerit')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'demerit' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>벌점 수동관리</button>
                  <button onClick={() => setActiveTab('rest')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'rest' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>휴식권 수동관리</button>
                </div>

                <form onSubmit={handleHistorySubmit} className="space-y-4">
                  {activeTab === 'rule' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">적용할 규정</label>
                      <select required value={selectedRuleId} onChange={e => setSelectedRuleId(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none text-sm">
                        <option value="" disabled>규정을 선택하세요...</option>
                        {rules.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (벌점 {r.demerit}, 휴식권 {r.rest})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setActionType('add')} className={`flex-1 py-2.5 rounded-lg border text-sm font-bold transition-colors ${actionType === 'add' ? (activeTab === 'demerit' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                          {activeTab === 'demerit' ? '벌점 부여' : '휴식권 발급'}
                        </button>
                        <button type="button" onClick={() => setActionType('deduct')} className={`flex-1 py-2.5 rounded-lg border text-sm font-bold transition-colors ${actionType === 'deduct' ? (activeTab === 'demerit' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700') : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                          {activeTab === 'demerit' ? '벌점 차감' : '휴식권 사용/차감'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">점수/수량</label>
                          <input required type="number" min="1" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none text-sm font-bold" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">사유 요약</label>
                          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="직접 입력" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none text-sm" />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">상세 메모</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="추가적인 설명이나 코멘트를 기록하세요." className="w-full p-3 h-24 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-slate-100 outline-none text-sm" />
                  </div>

                  <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${activeTab === 'rule' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : activeTab === 'demerit' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}>
                    기록 저장 및 지표 업데이트
                  </button>
                </form>
              </div>
            </div>

            {/* Right: History */}
            <div className="w-full md:w-1/2 flex flex-col bg-slate-50">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-800 flex items-center"><FileText size={18} className="mr-2 text-slate-500" /> 히스토리 내역</h3>
                <button onClick={() => setSelectedStudentId(null)} className="hidden md:block text-slate-400 hover:text-slate-800"><X size={20}/></button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {(!selectedStudent.demeritHistory || selectedStudent.demeritHistory.length === 0) ? (
                  <div className="text-center text-slate-400 mt-10">
                    <History size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">기록된 히스토리가 없습니다.</p>
                  </div>
                ) : (
                  selectedStudent.demeritHistory.map(record => (
                    <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${record.type === 'rule' ? 'bg-indigo-500' : record.type === 'demerit' ? (record.effectDemerit > 0 ? 'bg-red-500' : 'bg-blue-500') : (record.effectRest > 0 ? 'bg-green-500' : 'bg-orange-500')}`} />
                      <div className="pl-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-400 mr-2">{record.date}</span>
                            <span className="font-bold text-slate-800 text-sm">{record.reason}</span>
                          </div>
                          <button onClick={() => handleDeleteHistory(record.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {record.effectDemerit !== 0 && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${record.effectDemerit > 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>벌점 {record.effectDemerit > 0 ? '+'+record.effectDemerit : record.effectDemerit}</span>
                          )}
                          {record.effectRest !== 0 && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${record.effectRest > 0 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>휴식권 {record.effectRest > 0 ? '+'+record.effectRest : record.effectRest}</span>
                          )}
                        </div>
                        {record.note && <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2 rounded">{record.note}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}