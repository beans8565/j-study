"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { CalendarDays, CalendarRange, UserCheck, Printer, Plus, Edit, Trash2 } from "lucide-react"

export default function ReportsPage() {
  const { currentBranch, students } = useDashboard()
  const [activeTab, setActiveTab] = useState('daily') // daily, weekly, individual
  
  // Daily Reports State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reports, setReports] = useState<any[]>([])

  // Individual Reports State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [indvTab, setIndvTab] = useState<'plan'|'mock'|'inspection'>('inspection')
  const [indvReports, setIndvReports] = useState<any[]>([
    { id: '1', studentId: 'S001', type: 'inspection', date: '2026-03-01', title: '3월 1주차 학습 점검', content: '수학 과제 성취도 90% 달성, 국어 비문학 보완 필요' },
    { id: '2', studentId: 'S001', type: 'inspection', date: '2026-03-08', title: '3월 2주차 학습 점검', content: '영어 단어 암기 우수, 탐구 영역 복습량 부족' },
    { id: '3', studentId: 'S001', type: 'plan', date: '2026-03-02', title: '3월 첫째주 계획표', content: '수학 기출 3회독, 영어 단어 500개 암기' },
    { id: '4', studentId: 'S001', type: 'mock', date: '2026-03-05', title: '3월 학력평가 분석', content: '국어 85점, 수학 92점, 영어 88점. 수학 빈칸추론 약점 보완 필요.' }
  ])
  const [isEditingIndv, setIsEditingIndv] = useState<string | null>(null)
  const [indvForm, setIndvForm] = useState({ date: '', title: '', content: '' })

  const activeStudents = students.filter(s => s.branch === currentBranch && s.enrollmentStatus === '재원');

  useEffect(() => {
    setReports(activeStudents.map(s => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      attitudeScore: s.avgAchieve >= 80 ? "5" : s.avgAchieve >= 60 ? "4" : "3",
      comments: s.memo || ""
    })));
  }, [currentBranch, students])

  const handleChange = (id: string, field: string, value: string) => {
    const updated = reports.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    )
    setReports(updated)
  }

  const handleSave = () => {
    alert("일일 학습 리포트가 저장되었습니다.")
  }

  // --- Individual Report Handlers ---
  const handleAddIndvReport = () => {
    if (!selectedStudentId) return alert('학생을 먼저 선택해주세요.')
    const newRep = {
      id: Date.now().toString(),
      studentId: selectedStudentId,
      type: indvTab,
      date: new Date().toISOString().split('T')[0],
      title: '새 점검 리포트',
      content: ''
    }
    setIndvReports([newRep, ...indvReports])
    setIsEditingIndv(newRep.id)
    setIndvForm({ date: newRep.date, title: newRep.title, content: newRep.content })
  }

  const handleSaveIndvReport = () => {
    setIndvReports(indvReports.map(r => 
      r.id === isEditingIndv ? { ...r, ...indvForm } : r
    ))
    setIsEditingIndv(null)
  }

  const handleDeleteIndvReport = (id: string) => {
    if (confirm('정말 이 리포트를 삭제하시겠습니까?')) {
      setIndvReports(indvReports.filter(r => r.id !== id))
    }
  }

  const handleExportPDF = (report: any) => {
    const student = activeStudents.find(s => s.id === report.studentId)
    // Print window
    const printContents = `
      <div style="font-family: 'Malgun Gothic', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b;">
        <h1 style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; font-size: 28px; margin-bottom: 30px;">
          학생 학습 점검 리포트
        </h1>
        <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 30px; padding: 0 10px;">
          <p style="margin: 0;"><strong>학생명:</strong> ${student?.name} (${student?.grade})</p>
          <p style="margin: 0;"><strong>작성일:</strong> ${report.date}</p>
        </div>
        <div style="padding: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="margin-top: 0; font-size: 22px; color: #0f172a; margin-bottom: 20px;">
            ${report.title}
          </h2>
          <div style="white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #334155;">${report.content || '내용이 없습니다.'}</div>
        </div>
        <div style="text-align: center; margin-top: 60px; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <strong>제이스터디(J-Study) 관리형 독서실</strong><br>
          본 리포트는 학생의 학습 성취도와 태도를 기반으로 작성되었습니다.
        </div>
      </div>
    `;
    const win = window.open('', '', 'height=800,width=900');
    if (win) {
      win.document.write('<html><head><title>리포트 인쇄</title>');
      win.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>')
      win.document.write('</head><body style="margin:0; padding:0; background:white;">');
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-black text-slate-800 tracking-tight text-lg">점검 및 리포트</h2>
          <p className="text-xs text-slate-500 mt-1">지점별 학습 기록 관리</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'daily' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarDays size={18} />
            일일 종합 리포트
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarRange size={18} />
            주간 종합 분석
          </button>
          <div className="h-px bg-slate-100 my-4 w-full"></div>
          <button 
            onClick={() => setActiveTab('individual')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'individual' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <UserCheck size={18} />
            학생별 점검 기록
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
        {activeTab === 'daily' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">일일 학습 리포트</h1>
                <p className="text-sm text-slate-500 mt-1">{currentBranch} 학생들의 자습 태도와 특이사항을 기록합니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto bg-white shadow-sm border-slate-200" />
                <Button className="bg-slate-800 text-white shadow-sm hover:bg-slate-900">조회</Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-slate-200 hover:bg-slate-50">
                    <TableHead className="w-[120px] font-bold text-slate-700">이름</TableHead>
                    <TableHead className="w-[100px] font-bold text-slate-700">학년</TableHead>
                    <TableHead className="w-[150px] font-bold text-slate-700">자습 태도 점수</TableHead>
                    <TableHead className="font-bold text-slate-700">일일 특이사항 / 코멘트</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-500">조회된 학생이 없습니다.</TableCell>
                    </TableRow>
                  ) : reports.map((report) => (
                    <TableRow key={report.id} className="border-b-slate-100 hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-bold text-slate-800">{report.name}</TableCell>
                      <TableCell className="text-slate-500 text-sm font-medium">{report.grade}</TableCell>
                      <TableCell>
                        <Select value={report.attitudeScore} onValueChange={(val) => handleChange(report.id, 'attitudeScore', val)}>
                          <SelectTrigger className="h-9 text-xs font-medium bg-slate-50/50 border-slate-200 focus:ring-blue-500">
                            <SelectValue placeholder="점수 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5" className="font-bold text-blue-600">5점 (매우 우수)</SelectItem>
                            <SelectItem value="4" className="font-bold text-emerald-600">4점 (우수)</SelectItem>
                            <SelectItem value="3" className="font-medium text-slate-600">3점 (보통)</SelectItem>
                            <SelectItem value="2" className="font-medium text-orange-500">2점 (미흡)</SelectItem>
                            <SelectItem value="1" className="font-bold text-red-600">1점 (매우 미흡)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={report.comments} 
                          onChange={(e) => handleChange(report.id, 'comments', e.target.value)}
                          placeholder="오늘의 특이사항을 입력해주세요..." 
                          className="w-full h-9 text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-blue-500 transition-colors"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">초기화</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">전체 저장 및 학부모 알림 발송</Button>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <CalendarRange size={40} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">주간 종합 분석</h2>
            <p className="text-sm">해당 기능은 다음 업데이트에 제공될 예정입니다.</p>
          </div>
        )}

        {activeTab === 'individual' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold mb-2 uppercase tracking-widest border border-blue-100">Individual Records</div>
                <h1 className="text-2xl font-black text-slate-800 mb-1">학생별 점검 기록</h1>
                <p className="text-sm text-slate-500 font-medium">특정 학생의 개별 점검 및 상담 기록을 상세 관리하고 인쇄합니다.</p>
              </div>
              <div className="w-72">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">대상 학생 선택</label>
                <Select value={selectedStudentId} onValueChange={(val) => setSelectedStudentId(val || '')}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 font-bold text-slate-800 focus:ring-blue-500">
                    <SelectValue placeholder="재원생을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStudents.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-medium">{s.name} ({s.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!selectedStudentId ? (
              <div className="bg-transparent border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center text-slate-500">
                <UserCheck size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-bold text-slate-600 text-lg">학생을 선택해주세요</p>
                <p className="text-sm mt-1">상단에서 학생을 선택하면 점검 목록이 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Folder Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                  <button 
                    onClick={() => setIndvTab('plan')}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors border border-b-0 ${indvTab === 'plan' ? 'bg-white text-blue-600 border-slate-200 shadow-[0_2px_0_0_white]' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                  >
                    📝 계획표
                  </button>
                  <button 
                    onClick={() => setIndvTab('mock')}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors border border-b-0 ${indvTab === 'mock' ? 'bg-white text-blue-600 border-slate-200 shadow-[0_2px_0_0_white]' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                  >
                    📊 모의고사
                  </button>
                  <button 
                    onClick={() => setIndvTab('inspection')}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors border border-b-0 ${indvTab === 'inspection' ? 'bg-white text-blue-600 border-slate-200 shadow-[0_2px_0_0_white]' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                  >
                    📋 점검
                  </button>
                </div>

                <div className="bg-white p-6 rounded-b-xl rounded-tr-xl border border-slate-200 shadow-sm mt-[-24px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                      {indvTab === 'plan' ? '계획표 기록' : indvTab === 'mock' ? '모의고사 기록' : '점검 기록'} 
                      <span className="bg-blue-100 text-blue-700 text-xs font-black px-2 py-0.5 rounded-full ml-2">
                        {indvReports.filter(r => r.studentId === selectedStudentId && r.type === indvTab).length}
                      </span>
                    </h3>
                    <Button onClick={handleAddIndvReport} className="bg-slate-800 text-white hover:bg-slate-900 shadow-md">
                      <Plus size={16} className="mr-2" /> 새 기록 작성
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {indvReports.filter(r => r.studentId === selectedStudentId && r.type === indvTab).length === 0 ? (
                      <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <p className="font-medium text-slate-600">아직 등록된 기록이 없습니다.</p>
                        <p className="text-sm mt-1 text-slate-400">새 기록 작성 버튼을 눌러 추가해보세요.</p>
                      </div>
                    ) : (
                      indvReports.filter(r => r.studentId === selectedStudentId && r.type === indvTab).map(report => (
                      <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        {isEditingIndv === report.id ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-3">
                              <Input type="date" value={indvForm.date} onChange={e => setIndvForm({...indvForm, date: e.target.value})} className="w-40 font-medium" />
                              <Input value={indvForm.title} onChange={e => setIndvForm({...indvForm, title: e.target.value})} placeholder="리포트 제목 (예: 3월 2주차 주간 상담)" className="flex-1 font-bold text-lg" />
                            </div>
                            <textarea 
                              value={indvForm.content} 
                              onChange={e => setIndvForm({...indvForm, content: e.target.value})}
                              placeholder="점검 및 상담 내용을 상세히 기록하세요..."
                              className="w-full h-40 p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed transition-all"
                            />
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                              <Button variant="outline" onClick={() => setIsEditingIndv(null)} className="font-bold text-slate-600">작성 취소</Button>
                              <Button onClick={handleSaveIndvReport} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">저장 완료</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in fade-in">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md mb-2.5 inline-block border border-slate-200">작성일: {report.date}</span>
                                <h4 className="text-lg font-black text-slate-800">{report.title}</h4>
                              </div>
                              <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity bg-slate-50 p-1 rounded-lg border border-slate-100">
                                <button onClick={() => { setIsEditingIndv(report.id); setIndvForm({ date: report.date, title: report.title, content: report.content }) }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors" title="수정"><Edit size={16}/></button>
                                <button onClick={() => handleExportPDF(report)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-colors" title="PDF 인쇄"><Printer size={16}/></button>
                                <div className="w-px h-auto bg-slate-200 mx-0.5"></div>
                                <button onClick={() => handleDeleteIndvReport(report.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="삭제"><Trash2 size={16}/></button>
                              </div>
                            </div>
                            <div className="text-[13px] text-slate-700 whitespace-pre-wrap leading-loose bg-slate-50/80 p-5 rounded-xl border border-slate-100 font-medium">
                              {report.content || <span className="text-slate-400 italic">입력된 내용이 없습니다. 수정 버튼을 눌러 내용을 작성하세요.</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}