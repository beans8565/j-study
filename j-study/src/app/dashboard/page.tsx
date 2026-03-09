"use client"

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { useDashboard } from '@/components/providers/DashboardProvider';
import { 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  Headset, 
  BarChart, 
  Zap,
  UserPlus,
  CalendarCheck,
  FileSignature,
  ChevronRight,
  Calendar,
  Plus
} from 'lucide-react';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function DashboardPage() {
  const { currentBranch, leads, students } = useDashboard();
  
  const activeStudents = students.filter(s => s.branch === currentBranch && s.enrollmentStatus === '재원');
  const activeLeads = leads.filter(l => l.branch === currentBranch && l.status !== '이탈(종료)' && l.status !== '최종등록' && l.status !== '상담취소(노쇼)');
  
  const presentCount = activeStudents.filter(s => s.status === 'present').length;
  
  const gradeData = [
    activeStudents.filter(s => s.grade === '고3' || s.grade === 'N수').length,
    activeStudents.filter(s => s.grade === '고2').length,
    activeStudents.filter(s => s.grade === '고1').length,
  ];

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['고3/N수', '고2', '고1'],
            datasets: [{
              data: [
                activeStudents.filter(s => s.grade === '고3' || s.grade === 'N수').length,
                activeStudents.filter(s => s.grade === '고2').length,
                activeStudents.filter(s => s.grade === '고1').length,
              ],
              backgroundColor: [
                '#3b82f6', // blue-500
                '#6366f1', // indigo-500
                '#10b981'  // emerald-500
              ],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return ' ' + context.label + ': ' + context.raw + '명';
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeStudents.length]); // only re-render chart when active students count changes

  return (
    <div className="p-6 md:p-8 bg-slate-50/50 animate-in fade-in pb-24 h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">총 재원생</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{activeStudents.length}<span className="text-sm font-medium text-slate-500 ml-1">명</span></h3>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50 rounded-tl-full -z-10 translate-x-8 translate-y-8 group-hover:bg-blue-100 transition-colors"></div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">금주 계획표 점검 (완료/전체)</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{activeStudents.filter(s => s.lastPlanStatus === 'submitted').length}<span className="text-lg font-medium text-slate-400 mx-1">/</span>{activeStudents.length}</h3>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 absolute bottom-0 left-0">
              <div className="bg-emerald-500 h-1.5" style={{ width: '42%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:border-red-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">요주의 점검 대상 (경고)</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-red-600">{activeStudents.filter(s => s.penaltyPoints >= 3).length}<span className="text-sm font-medium text-slate-500 ml-1">명</span></h3>
              </div>
            </div>
            <div className="absolute right-4 top-4 text-slate-300 group-hover:text-red-300"><ChevronRight size={16} /></div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              <Headset size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">신규 문의 대기</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{activeLeads.length}<span className="text-sm font-medium text-slate-500 ml-1">건</span></h3>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-50 rounded-tl-full -z-10 translate-x-8 translate-y-8 group-hover:bg-purple-100 transition-colors"></div>
          </div>
        </div>

        {/* 2. Charts & Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Analytics Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center"><BarChart className="text-blue-500 mr-2" size={18} />학년 및 프로그램 분포 현황</h3>
              <select className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600 bg-slate-50">
                <option>전체 보기</option>
                <option>스탠다드 전용</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-52 relative">
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-600">고3 / N수</span><span className="text-blue-600">{activeStudents.filter(s => s.grade === '고3' || s.grade === 'N수').length}명 ({activeStudents.length > 0 ? Math.round((activeStudents.filter(s => s.grade === '고3' || s.grade === 'N수').length / activeStudents.length) * 100) : 0}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${activeStudents.length > 0 ? (activeStudents.filter(s => s.grade === '고3' || s.grade === 'N수').length / activeStudents.length) * 100 : 0}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-600">고2</span><span className="text-indigo-500">{activeStudents.filter(s => s.grade === '고2').length}명 ({activeStudents.length > 0 ? Math.round((activeStudents.filter(s => s.grade === '고2').length / activeStudents.length) * 100) : 0}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${activeStudents.length > 0 ? (activeStudents.filter(s => s.grade === '고2').length / activeStudents.length) * 100 : 0}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-600">고1</span><span className="text-emerald-500">{activeStudents.filter(s => s.grade === '고1').length}명 ({activeStudents.length > 0 ? Math.round((activeStudents.filter(s => s.grade === '고1').length / activeStudents.length) * 100) : 0}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${activeStudents.length > 0 ? (activeStudents.filter(s => s.grade === '고1').length / activeStudents.length) * 100 : 0}%` }}></div></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">스탠다드 모드</p>
                    <p className="text-lg font-black text-blue-700">{activeStudents.filter(s => s.program === 'S').length}<span className="text-xs font-medium text-slate-400 ml-0.5">명</span></p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">라이트 모드</p>
                    <p className="text-lg font-black text-slate-700">{activeStudents.filter(s => s.program === 'L').length}<span className="text-xs font-medium text-slate-400 ml-0.5">명</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-5 flex items-center"><Zap className="text-amber-400 mr-2" size={18} />빠른 실행 (Quick Actions)</h3>
            <div className="grid grid-cols-1 gap-3 flex-1">
              <Link href="/dashboard/students" className="flex items-center p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group text-left w-full">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3 shadow-sm">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700 group-hover:text-blue-800 transition-colors">신규 학생 등록</p>
                  <p className="text-[10px] text-slate-500">통합 DB 프로필 생성</p>
                </div>
              </Link>
              
              <Link href="#" className="flex items-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all group text-left w-full">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mr-3 shadow-sm">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-800 transition-colors">주간 계획표 점검</p>
                  <p className="text-[10px] text-slate-500">스케줄 작성 및 O/X 체크</p>
                </div>
              </Link>

              <Link href="/dashboard/reports" className="flex items-center p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group text-left w-full">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-3 shadow-sm">
                  <FileSignature size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700 group-hover:text-emerald-800 transition-colors">학부모 리포트 발송</p>
                  <p className="text-[10px] text-slate-500">상담 일지 및 PDF 생성</p>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* 3. Bottom Alert & Schedule List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Alert List (Problematic Students) */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-red-700 flex items-center"><AlertTriangle className="mr-2" size={16} />집중 점검 요망 리스트</h3>
              <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-1 rounded border border-red-200">{activeStudents.filter(s => s.penaltyPoints >= 3).length}명</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {activeStudents.filter(s => s.penaltyPoints >= 3).map((student, i) => (
                <li key={i} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-800">{student.name} ({student.grade})</span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">벌점 누적</span>
                    </div>
                    <p className="text-[11px] text-slate-500">누적 벌점 {student.penaltyPoints}점 (면담 필요)</p>
                  </div>
                  <button className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-blue-600 hover:border-blue-300 shadow-sm transition-colors">DB 확인</button>
                </li>
              ))}
              {activeStudents.filter(s => s.penaltyPoints >= 3).length === 0 && (
                <li className="p-8 text-center text-slate-500 text-sm font-medium">요주의 학생이 없습니다.</li>
              )}
            </ul>
            <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
              <Link href="/dashboard/students" className="text-xs font-bold text-blue-600 hover:underline">전체 학생 목록 보기</Link>
            </div>
          </div>

          {/* Today's Schedule (CRM / Consults) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center"><Calendar className="text-blue-500 mr-2" size={16} />금일 상담 및 1:1 점검 일정</h3>
              <button className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"><Plus size={12} /></button>
            </div>
            <ul className="divide-y divide-slate-100 h-[280px] overflow-y-auto custom-scroll p-2">
              <li className="p-3 flex items-start gap-4">
                <div className="w-12 text-center shrink-0">
                  <span className="block text-xs font-black text-slate-800">14:00</span>
                  <span className="text-[9px] font-bold text-slate-400">오후</span>
                </div>
                <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-indigo-900">신규 학부모 방문 상담</span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-white px-1.5 py-0.5 rounded border border-indigo-100">원장님</span>
                  </div>
                  <p className="text-[11px] text-slate-600">고1 남학생, 내신 대비 위주 상담 (지인 추천)</p>
                </div>
              </li>
              <li className="p-3 flex items-start gap-4">
                <div className="w-12 text-center shrink-0">
                  <span className="block text-xs font-black text-slate-800">16:30</span>
                  <span className="text-[9px] font-bold text-slate-400">오후</span>
                </div>
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-blue-900">엄서윤 (고2) 주간 점검</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-white px-1.5 py-0.5 rounded border border-blue-100">김제이 실장</span>
                  </div>
                  <p className="text-[11px] text-slate-600">수학 오답노트 필수 점검, 계획표 리포트 작성</p>
                </div>
              </li>
              <li className="p-3 flex items-start gap-4 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 text-center shrink-0">
                  <span className="block text-xs font-black text-slate-800">19:00</span>
                  <span className="text-[9px] font-bold text-slate-400">저녁</span>
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400 rounded-l-xl"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-700">문종현 (고3) 수시 전략 상담</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">김제이 실장</span>
                  </div>
                  <p className="text-[11px] text-slate-500">6평 결과 기반 최저 맞춤형 픽스</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="h-10"></div>
      </div>
    </div>
  )
}
