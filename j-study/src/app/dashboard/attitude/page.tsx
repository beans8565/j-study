"use client"

import { useState } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { Button } from "@/components/ui/button"
import { BarChart, FileDown, CalendarDays, CalendarRange } from "lucide-react"

export default function AttitudeReportPage() {
  const { currentBranch } = useDashboard()
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('monthly')
  const [period, setPeriod] = useState("2026-02")
  const [isGenerating, setIsGenerating] = useState(false)

  // Demo stats based on provided HTML
  const stats = {
    s: 40, a: 30, b: 0, c: 10, d: 20
  }

  const topPerformers = [
    { rank: 1, name: "김현규", score: "14회", type: "의무 외 자습" },
    { rank: 2, name: "한상학", score: "10회", type: "의무 외 자습" },
    { rank: 1, name: "황석현", score: "23회", type: "영단어 통과" },
  ]

  const bottomPerformers = [
    { name: "김현규", score: "36회", reason: "졸음 적발" },
    { name: "김승찬", score: "31회", reason: "졸음 적발" },
    { name: "김승찬", score: "7회", reason: "지각 누적" },
    { name: "이서연", score: "26개", reason: "휴식권 소진" },
  ]

  const studentDataList = [
    { name: "황석현", grade: "S", score: 100, color: "text-blue-500", bg: "bg-blue-50",
      deductions: [{label: "졸음 적발 (7회)", val: "-10점"}, {label: "휴식권 (5개)", val: "-5점"}], 
      bonuses: [{label: "영단어 통과 (23회)", val: "+23점"}, {label: "자습 (1회)", val: "+2점"}], 
      insight: "영단어 암기(23회) 부문 압도적 1위입니다. 탁월한 성실함으로 모든 감점 요소를 극복했습니다." },
    { name: "김태희", grade: "S", score: 91, color: "text-blue-500", bg: "bg-blue-50",
      deductions: [{label: "휴식권 (10개)", val: "-10점"}, {label: "지각 (1회)", val: "-2점"}], 
      bonuses: [{label: "의무 외 자습 (2회)", val: "+4점"}], 
      insight: "우수한 성적을 기록했으나 휴식권 사용이 다소 많습니다. 체력 안배에 신경 쓰면 완벽할 것입니다." },
    { name: "한상학", grade: "A", score: 87, color: "text-emerald-500", bg: "bg-emerald-50",
      deductions: [{label: "휴식권 (13개)", val: "-13점"}, {label: "졸음 (9회)", val: "-12점"}], 
      bonuses: [{label: "자습 (10회)", val: "+20점"}], 
      insight: "자기주도학습은 매우 훌륭하나, 잦은 졸음과 휴식권 사용으로 점수가 하락했습니다. 집중력을 높여야 합니다." },
    { name: "김승찬", grade: "D", score: 40, color: "text-red-500", bg: "bg-red-50",
      deductions: [{label: "졸음 (31회)", val: "-62점"}, {label: "지각 (7회)", val: "-10점"}], 
      bonuses: [{label: "자습 (8회)", val: "+16점"}], 
      insight: "잦은 지각과 심각한 졸음이 겹쳐 정규 학습 시간 활용이 거의 이루어지지 않고 있습니다." },
  ]

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      
      const opt = {
        margin:       10,
        filename:     `${currentBranch}_${activeTab === 'monthly' ? '월간' : '주간'}_학습태도보고서_${period}.pdf`,
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
          <p className="text-xs text-slate-500 mt-1">지점별 학습태도 통계 리포트</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarDays size={18} />
            주간 학습태도 보고서
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CalendarRange size={18} />
            월간 학습태도 보고서
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
                {currentBranch} {activeTab === 'monthly' ? '월간' : '주간'} 학습태도 종합 보고서
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
    </div>
  )
}