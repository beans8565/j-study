"use client"

import { useState } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { Button } from "@/components/ui/button"
import { BarChart, FileDown, CalendarDays, CalendarRange, Settings, X, Plus, Trash2 } from "lucide-react"

// Types for Settings
type GradeCriteria = { id: string, label: string, min: number, max: number, color: string }
type PointItem = { id: string, type: 'deduction' | 'bonus', name: string, points: number }

export default function AttitudeReportPage() {
  const { currentBranch } = useDashboard()
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('monthly')
  const [period, setPeriod] = useState("2026-02")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [grades, setGrades] = useState<GradeCriteria[]>([
    { id: '1', label: 'S (최우수)', min: 95, max: 100, color: 'blue' },
    { id: '2', label: 'A (우수)', min: 83, max: 94, color: 'emerald' },
    { id: '3', label: 'B (보통)', min: 74, max: 82, color: 'slate' },
    { id: '4', label: 'C (미흡)', min: 65, max: 73, color: 'orange' },
    { id: '5', label: 'D (불량)', min: 0, max: 64, color: 'red' },
  ])
  const [pointItems, setPointItems] = useState<PointItem[]>([
    { id: 'p1', type: 'deduction', name: '무단 지각', points: -3 },
    { id: 'p2', type: 'deduction', name: '사전 보고 지각', points: -1 },
    { id: 'p3', type: 'deduction', name: '무단 결석', points: -10 },
    { id: 'p4', type: 'deduction', name: '졸음 (1회)', points: -1 },
    { id: 'p5', type: 'deduction', name: '동일 교시 졸음 2회', points: -3 },
    { id: 'p6', type: 'deduction', name: '무단 이석', points: -2 },
    { id: 'p7', type: 'deduction', name: '휴식권 초과 (1장당)', points: -3 },
    { id: 'p8', type: 'bonus', name: '휴식권 미사용 (1장당)', points: 1 },
    { id: 'p9', type: 'bonus', name: '마지막 교시 잔류', points: 3 },
    { id: 'p10', type: 'bonus', name: '영단어 통과', points: 1 },
  ])

  const handleAddPointItem = (type: 'deduction' | 'bonus') => {
    setPointItems([...pointItems, { id: `new_${Date.now()}`, type, name: '', points: type === 'bonus' ? 1 : -1 }])
  }

  // Demo stats based on provided HTML
  const stats = {
    s: 0, a: 0, b: 0, c: 0, d: 0
  }

  const topPerformers: any[] = []

  const bottomPerformers: any[] = []

  const studentDataList: any[] = []

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      
      const opt = {
        margin:       10,
        filename:     `${currentBranch}_${activeTab === 'monthly' ? '월간' : '주간'}_자습태도보고서_${period}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-black text-slate-800 tracking-tight text-lg flex items-center gap-2">
            <BarChart size={18} className="text-blue-600" /> 종합 보고서
          </h2>
          <p className="text-xs text-slate-500 mt-1">지점별 자습태도 통계 리포트</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarDays size={18} />
            주간 자습태도 보고서
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarRange size={18} />
            월간 자습태도 보고서
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
          
          <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold mb-2 uppercase tracking-widest border border-indigo-100">
                <BarChart size={12} /> {activeTab === 'monthly' ? 'Monthly Report' : 'Weekly Report'}
              </div>
              <h1 className="text-2xl font-black text-slate-800 mb-1">
                {currentBranch} {activeTab === 'monthly' ? '월간' : '주간'} 자습태도 종합 보고서
              </h1>
              <p className="text-sm text-slate-500 font-medium">전체 학생의 태도 점수 통계 및 우수/미흡 학생 분석 결과를 제공합니다.</p>
            </div>
            <div className="flex gap-3">
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeTab === 'monthly' ? (
                  <>
                    <option value="2026-03">2026년 3월</option>
                    <option value="2026-02">2026년 2월</option>
                    <option value="2026-01">2026년 1월</option>
                  </>
                ) : (
                  <>
                    <option value="2026-03-w2">2026년 3월 2주차</option>
                    <option value="2026-03-w1">2026년 3월 1주차</option>
                    <option value="2026-02-w4">2026년 2월 4주차</option>
                  </>
                )}
              </select>
              <Button 
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 h-11 px-4 shadow-sm"
              >
                <Settings size={18} className="mr-2" /> 평가 기준 설정
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isGenerating}
                className="bg-slate-800 text-white hover:bg-slate-900 shadow-md h-11 px-5"
              >
                {isGenerating ? "PDF 생성 중..." : <><FileDown size={18} className="mr-2" /> PDF 다운로드</>}
              </Button>
            </div>
          </div>

          <div id="report-content" className="bg-slate-50 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 통계 요약 (좌) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart size={20} className="text-blue-500" /> 전체 등급 분포 비율
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-blue-600">S 등급 (90점 이상)</span>
                    <span className="text-xl font-black text-slate-800">{stats.s}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-emerald-600">A 등급 (80~89점)</span>
                    <span className="text-xl font-black text-slate-800">{stats.a}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-orange-500">C 등급 (60~69점)</span>
                    <span className="text-xl font-black text-slate-800">{stats.c}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-red-500">D 등급 (60점 미만)</span>
                    <span className="text-xl font-black text-slate-800">{stats.d}%</span>
                  </div>
                </div>
              </div>

              {/* 우수 / 집중관리 요약 (우) */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-indigo-500 flex-1">
                  <h3 className="font-bold text-indigo-600 mb-3 text-sm">🏆 항목별 우수 학생 (Top Performers)</h3>
                  <div className="space-y-2">
                    {topPerformers.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600"><span className="font-bold text-slate-800">{p.rank}위. {p.name}</span> ({p.type})</span>
                        <span className="font-bold text-indigo-600">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-red-500 flex-1">
                  <h3 className="font-bold text-red-600 mb-3 text-sm">🚨 항목별 집중 관리 필요 (Needs Improvement)</h3>
                  <div className="space-y-2">
                    {bottomPerformers.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600"><span className="font-bold text-slate-800">{p.name}</span> ({p.reason})</span>
                        <span className="font-bold text-red-500">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-4 px-2">개인별 상세 평가 결과</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {studentDataList.map((std, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row page-break-inside-avoid">
                  {/* 좌측 프로필 */}
                  <div className={`${std.bg} w-full md:w-64 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200`}>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">{std.name}</h2>
                    <div className={`text-7xl font-black ${std.color} mb-2 leading-none drop-shadow-sm`}>{std.grade}</div>
                    <div className="text-sm font-bold text-slate-600 bg-white/60 px-4 py-1.5 rounded-full border border-slate-200/50">
                      최종 <span className={`text-xl ${std.color}`}>{std.score}</span> 점
                    </div>
                  </div>
                  
                  {/* 우측 상세 */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* 감점 */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 border-l-4 border-l-red-400">
                        <h4 className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wide">감점 요인</h4>
                        <ul className="space-y-1.5">
                          {std.deductions.map((d, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600 font-medium">{d.label}</span>
                              <span className="font-bold text-red-500">{d.val}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* 가산점 */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 border-l-4 border-l-emerald-400">
                        <h4 className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">가산점 요인</h4>
                        <ul className="space-y-1.5">
                          {std.bonuses.map((b, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600 font-medium">{b.label}</span>
                              <span className="font-bold text-emerald-500">{b.val}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* 코멘트 */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        <span className="font-bold text-blue-600 mr-2">📌 분석 코멘트:</span>
                        {std.insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={20} className="text-blue-600" />
                  자습태도 평가 기준 설정
                </h2>
                <p className="text-sm text-slate-500 mt-1">등급 커트라인과 가감점 배점을 지점 상황에 맞게 커스텀합니다.</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              {/* Grade Settings */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart size={18} className="text-slate-600" /> 1. 등급 구간 설정
                </h3>
                <div className="space-y-3">
                  {grades.map(grade => (
                    <div key={grade.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-24 font-bold text-${grade.color}-600`}>{grade.label}</div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={grade.min} onChange={(e) => setGrades(grades.map(g => g.id === grade.id ? {...g, min: Number(e.target.value)} : g))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-center font-bold" />
                        <span className="text-slate-400">점 ~</span>
                        <input type="number" value={grade.max} onChange={(e) => setGrades(grades.map(g => g.id === grade.id ? {...g, max: Number(e.target.value)} : g))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-center font-bold" />
                        <span className="text-slate-400">점</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deductions */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-red-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-red-600">2. 의무 위반 감점 (-)</h3>
                    <Button size="sm" variant="outline" onClick={() => handleAddPointItem('deduction')} className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50">
                      <Plus size={14} className="mr-1" /> 항목 추가
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pointItems.filter(p => p.type === 'deduction').map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input type="text" value={item.name} onChange={(e) => setPointItems(pointItems.map(p => p.id === item.id ? {...p, name: e.target.value} : p))} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm" placeholder="감점 사유" />
                        <input type="number" value={item.points} onChange={(e) => setPointItems(pointItems.map(p => p.id === item.id ? {...p, points: Number(e.target.value)} : p))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-center text-red-600 font-bold" />
                        <button onClick={() => setPointItems(pointItems.filter(p => p.id !== item.id))} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonuses */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-emerald-600">3. 자율 성취 가산점 (+)</h3>
                    <Button size="sm" variant="outline" onClick={() => handleAddPointItem('bonus')} className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                      <Plus size={14} className="mr-1" /> 항목 추가
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pointItems.filter(p => p.type === 'bonus').map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input type="text" value={item.name} onChange={(e) => setPointItems(pointItems.map(p => p.id === item.id ? {...p, name: e.target.value} : p))} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm" placeholder="가산 사유" />
                        <input type="number" value={item.points} onChange={(e) => setPointItems(pointItems.map(p => p.id === item.id ? {...p, points: Number(e.target.value)} : p))} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm text-center text-emerald-600 font-bold" />
                        <button onClick={() => setPointItems(pointItems.filter(p => p.id !== item.id))} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-white shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="px-6 border-slate-200">취소</Button>
              <Button onClick={() => {
                alert('평가 기준이 저장되었습니다. 향후 리포트 생성 시 이 기준이 적용됩니다.');
                setIsSettingsOpen(false);
              }} className="px-8 bg-blue-600 hover:bg-blue-700 shadow-md">
                저장 및 적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}