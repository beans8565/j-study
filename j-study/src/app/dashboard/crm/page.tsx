"use client"

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/components/providers/DashboardProvider';
import { 
  BarChart3, 
  Users, 
  PhoneCall, 
  ClipboardList, 
  AlertTriangle,
  UserX,
  CalendarClock,
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  ArrowLeft
} from 'lucide-react';

const exportToCSV = (data: any[], filename: string, getTodayString: () => string) => {
  if (!data || data.length === 0) {
    alert('출력할 데이터가 없습니다.');
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
      return `"${val.replace(/"/g, '""')}"`; 
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${getTodayString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToJSON = (dataObj: any, filename: string, getTodayString: () => string) => {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${getTodayString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getDaysDiff = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Remove initialLeads, initialStudents, etc from global scope (we use context now)
const initialLogs = [
  { id: 'LOG01', date: '2026-02-25', student: '정현우', week: '2월 3주차', achieve: 55, issue: '수학 기출분석 3일치 미수행', rootCause: '수학학원 숙제 과다로 인한 자습시간 부족', solution: '수학학원 숙제량 조율 및 다음주 배정 20% 축소' },
  { id: 'LOG02', date: '2026-02-25', student: '최윤진', week: '2월 3주차', achieve: 85, issue: '영단어 누적테스트 미통과', rootCause: '단기 휘발성 암기 반복', solution: '주말 플랜에 영단어 누적테스트 강제 배치' },
];

export default function JstudyCRM() {
  const { currentBranch, leads: allLeads, setLeads, students: allStudents, setStudents, updateLeadStatus, deleteLead } = useDashboard();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState(initialLogs);

  const leads = allLeads.filter(l => l.branch === currentBranch);
  const students = allStudents.filter(s => s.branch === currentBranch);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({ 
    date: getTodayString(), 
    name: '', 
    grade: '고1', 
    path: '검색광고', 
    note: '' 
  });

  const handleAddLead = () => {
    if (!newLead.name.trim()) return;
    const newId = `L${String(Date.now()).slice(-4)}`;
    const leadToAdd = {
      id: newId,
      branch: currentBranch,
      date: newLead.date || getTodayString(),
      bookedDate: '',
      name: newLead.name,
      grade: newLead.grade,
      path: newLead.path,
      status: '신규문의',
      note: newLead.note,
      reason: ''
    };
    setLeads([leadToAdd, ...allLeads]);
    setShowAddModal(false);
    setNewLead({ date: getTodayString(), name: '', grade: '고1', path: '검색광고', note: '' });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateLeadStatus(id, newStatus);
  };

  const handleDateChange = (id: string, newDate: string) => {
    setLeads(allLeads.map(lead => lead.id === id ? { ...lead, bookedDate: newDate } : lead));
  };

  const totalLeads = leads.length;
  const totalConsultBooked = leads.filter(l => ['상담예약', '상담취소(노쇼)', '상담완료', '체험예약', '체험취소(노쇼)', '체험중', '최종등록'].includes(l.status)).length;
  const consultCanceled = leads.filter(l => l.status === '상담취소(노쇼)').length;
  const consultCancelRate = totalConsultBooked ? Math.round((consultCanceled / totalConsultBooked) * 100) : 0;
  const regCount = leads.filter(l => l.status === '최종등록').length;

  const pendingReservations = leads.filter(l => ['상담예약', '체험예약'].includes(l.status));
  const riskyReservations = pendingReservations.filter(l => {
    const diff = getDaysDiff(l.date, l.bookedDate);
    return diff !== null && diff > 3;
  });

  const riskStudents = students.filter(s => s.avgAchieve < 70);

  const DashboardView = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (importedData.leads) setLeads(importedData.leads);
          if (importedData.students) setStudents(importedData.students);
          if (importedData.logs) setLogs(importedData.logs);
          alert('데이터 복원이 성공적으로 완료되었습니다.');
        } catch (error) {
          alert('올바른 형식의 백업 파일(JSON)이 아닙니다.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    };

    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-in fade-in pb-24 md:pb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b pb-2">제이스터디 통합 대시보드</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center">
            <p className="text-[11px] md:text-sm text-gray-500 font-semibold flex items-center gap-1">
              <UserX size={14} className="text-red-500"/> 전체 예약 부도율
            </p>
            <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1 md:mt-2">{consultCancelRate}%</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-300 flex flex-col justify-center animate-pulse">
            <p className="text-[11px] md:text-sm text-red-700 font-bold flex items-center gap-1">
              <CalendarClock size={14} /> 노쇼 위험군 (3일 초과)
            </p>
            <p className="text-2xl md:text-3xl font-black text-red-800 mt-1 md:mt-2">{riskyReservations.length}건</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center">
            <p className="text-xs md:text-sm text-gray-500 font-semibold">최종 전환율 (등록)</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">
              {totalLeads ? Math.round((regCount / totalLeads) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center">
            <p className="text-[11px] md:text-sm text-gray-500 font-semibold flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-500"/> 학습 위험군 (70% 미만)
            </p>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600 mt-1 md:mt-2">{riskStudents.length}명</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-md md:text-lg font-bold text-gray-800 mb-2">🚨 리드타임(예약 대기시간) 방어 지침</h3>
            <p className="text-xs text-gray-500 mb-4">"유입일로부터 예약일이 3일을 초과할 경우 이탈 확률이 급증합니다."</p>
            
            {riskyReservations.length > 0 ? (
              <div className="overflow-x-auto border rounded border-red-200 mb-4 w-full">
                <table className="w-full text-xs md:text-sm text-left min-w-[500px]">
                  <thead className="bg-red-50 text-red-800">
                    <tr>
                      <th className="py-2 px-3">학생명</th>
                      <th className="py-2 px-3">상태</th>
                      <th className="py-2 px-3">유입~예약 간격</th>
                      <th className="py-2 px-3">실장 Action Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskyReservations.map(r => {
                      const diff = getDaysDiff(r.date, r.bookedDate);
                      return (
                        <tr key={r.id} className="border-t border-red-100 bg-white">
                          <td className="py-2 px-3 font-bold whitespace-nowrap">{r.name}({r.grade})</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <div className="font-semibold">{r.status}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{formatDateTime(r.bookedDate)}</div>
                          </td>
                          <td className="py-2 px-3 font-black text-red-600 whitespace-nowrap">+{diff}일</td>
                          <td className="py-2 px-3 font-semibold text-blue-700 bg-blue-50">
                            금일 중 사전 연락망 가동 (리마인드콜)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-green-50 text-green-700 text-sm rounded border border-green-200 font-bold">
                현재 3일 초과 위험군(예약건)이 없습니다.
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm border border-slate-700 text-white mt-2">
            <div className="flex items-center gap-2 mb-4">
              <Database size={20} className="text-blue-400" />
              <h3 className="text-md md:text-lg font-bold">시스템 데이터 입출력 (Data I/O)</h3>
            </div>
            <p className="text-[10px] md:text-xs text-slate-300 mb-4 border-b border-slate-600 pb-3">
              정확한 원인 분석 및 2차 가공을 위해 데이터를 엑셀(CSV)로 추출하거나, 시스템 전체 백업(JSON)을 진행합니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 mb-2">📊 엑셀(CSV) 다운로드</div>
                <button onClick={() => exportToCSV(leads, '제이스터디_퍼널DB', getTodayString)} className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-xs md:text-sm transition">
                  <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> 신규 콜/퍼널 DB</span>
                  <Download size={16} />
                </button>
                <button onClick={() => exportToCSV(students, '제이스터디_재원생DB', getTodayString)} className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-xs md:text-sm transition">
                  <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> 재원생 마스터 DB</span>
                  <Download size={16} />
                </button>
                <button onClick={() => exportToCSV(logs, '제이스터디_액션로그', getTodayString)} className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-xs md:text-sm transition">
                  <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> 주간 점검(Action Log) DB</span>
                  <Download size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 mb-2">💽 전체 시스템 백업 및 복원</div>
                <button onClick={() => exportToJSON({leads, students, logs}, '제이스터디_전체백업', getTodayString)} className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-xs md:text-sm font-bold transition">
                  <span className="flex items-center gap-2"><Download size={16}/> 시스템 전체 백업 (JSON 다운로드)</span>
                </button>
                
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleImportJSON} 
                  className="hidden" 
                />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-xs md:text-sm font-bold transition">
                  <span className="flex items-center gap-2"><Upload size={16}/> 백업 데이터 불러오기</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1">* 백업 불러오기 시 기존 데이터는 덮어씌워집니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FunnelView = () => (
    <div className="p-4 md:p-6 animate-in fade-in pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">신규 콜 & 퍼널 (리드타임 추적)</h2>
        <button 
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded shadow hover:bg-blue-700 text-xs md:text-sm font-semibold w-full md:w-auto"
        >
          + 신규 DB 등록
        </button>
      </div>

      {showAddModal && (
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 mb-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-blue-800 mb-3">신규 문의 DB 추가</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
            <input 
              type="date" 
              title="유입일자"
              value={newLead.date} 
              onChange={e => setNewLead({...newLead, date: e.target.value})} 
              className="border rounded p-2 text-xs md:text-sm outline-none focus:border-blue-500 font-semibold text-gray-700 w-full" 
            />
            <input 
              type="text" 
              placeholder="학생명 (필수)" 
              value={newLead.name} 
              onChange={e => setNewLead({...newLead, name: e.target.value})} 
              className="border rounded p-2 text-xs md:text-sm outline-none focus:border-blue-500 w-full" 
            />
            <select 
              value={newLead.grade} 
              onChange={e => setNewLead({...newLead, grade: e.target.value})} 
              className="border rounded p-2 text-xs md:text-sm outline-none bg-white focus:border-blue-500 w-full"
            >
              <option value="중3">중3</option>
              <option value="고1">고1</option>
              <option value="고2">고2</option>
              <option value="고3">고3</option>
              <option value="N수">N수</option>
            </select>
            <select 
              value={newLead.path} 
              onChange={e => setNewLead({...newLead, path: e.target.value})} 
              className="border rounded p-2 text-xs md:text-sm outline-none bg-white focus:border-blue-500 w-full"
            >
              <option value="검색광고">검색광고</option>
              <option value="블로그">블로그</option>
              <option value="지인소개">지인소개</option>
              <option value="전단/현수막">전단/현수막</option>
            </select>
            <input 
              type="text" 
              placeholder="특이사항/문제점" 
              value={newLead.note} 
              onChange={e => setNewLead({...newLead, note: e.target.value})} 
              className="border rounded p-2 text-xs md:text-sm outline-none focus:border-blue-500 w-full col-span-2 md:col-span-1" 
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded text-xs md:text-sm font-bold hover:bg-gray-400 shadow-sm w-full md:w-auto">
              취소
            </button>
            <button onClick={handleAddLead} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs md:text-sm font-bold hover:bg-indigo-700 shadow-sm w-full md:w-auto">
              저장하기 (DB 추가)
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto w-full">
        <table className="w-full text-xs md:text-sm text-left min-w-[800px]">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-3 whitespace-nowrap">유입일자</th>
              <th className="py-2 px-3 whitespace-nowrap">학생명(학년)</th>
              <th className="py-2 px-3 whitespace-nowrap bg-gray-700">일정(예약일)</th>
              <th className="py-2 px-3 whitespace-nowrap">현재 상태</th>
              <th className="py-2 px-3 min-w-[150px]">분석/특이사항</th>
              <th className="py-2 px-3 whitespace-nowrap">상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const diff = getDaysDiff(lead.date, lead.bookedDate);
              const isRisky = diff !== null && diff > 3 && ['상담예약', '체험예약'].includes(lead.status);
              
              return (
                <tr key={lead.id} className={`border-b hover:bg-gray-50 ${isRisky ? 'bg-red-50/50' : ''}`}>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-600">{lead.date}</td>
                  <td className="py-2 px-3 font-semibold whitespace-nowrap">
                    {lead.name} <span className="text-gray-500 text-[10px] md:text-xs">({lead.grade})</span>
                  </td>
                  
                  <td className="py-2 px-3 whitespace-nowrap font-medium min-w-[150px]">
                    <input 
                      type="datetime-local" 
                      value={lead.bookedDate || ''}
                      onChange={(e) => handleDateChange(lead.id, e.target.value)}
                      className="text-[10px] md:text-xs border border-gray-300 rounded p-1 text-gray-700 outline-none w-full max-w-[130px] bg-white"
                    />
                    {diff !== null && diff > 0 && (
                      <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold inline-block ${diff > 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                        +{diff}일
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold
                      ${lead.status.includes('취소') || lead.status.includes('이탈') ? 'bg-red-100 text-red-700' : 
                        lead.status === '최종등록' ? 'bg-green-100 text-green-700' : 
                        ['상담예약','체험예약'].includes(lead.status) ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[10px] md:text-xs text-gray-600 truncate max-w-[200px]">
                    {lead.status.includes('취소') ? <span className="font-bold text-red-500">[노쇼] </span> : ''}
                    {lead.reason || lead.note}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap min-w-[130px]">
                    <div className="flex items-center gap-1">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-[10px] md:text-xs border border-gray-300 rounded p-1.5 text-gray-700 outline-none w-full bg-white"
                      >
                        <option value="">상태 변경</option>
                        <option value="신규문의">신규문의</option>
                        <option value="상담예약">👉 상담예약</option>
                        <option value="상담취소(노쇼)">🚨 상담취소(노쇼)</option>
                        <option value="상담완료">상담완료</option>
                        <option value="체험예약">👉 체험예약</option>
                        <option value="체험취소(노쇼)">🚨 체험취소(노쇼)</option>
                        <option value="체험중">체험중</option>
                        <option value="최종등록">✅ 최종등록</option>
                        <option value="이탈(종료)">❌ 이탈(종료)</option>
                      </select>
                      <button 
                        onClick={() => {
                          if (window.confirm(`${lead.name} 학생의 문의 내역을 삭제하시겠습니까?`)) {
                            deleteLead(lead.id);
                          }
                        }}
                        className="px-2 py-1.5 text-[10px] md:text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded border border-red-200 transition-colors"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CRMView = () => (
    <div className="p-4 md:p-6 animate-in fade-in pb-24 md:pb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">재원생 마스터</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {students.map(student => (
          <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md md:text-lg font-bold">{student.name} <span className="text-xs text-gray-500 font-normal">({student.grade})</span></h3>
              <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${student.avgAchieve < 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                평균 {student.avgAchieve}%
              </span>
            </div>
            <div className="space-y-2 mt-3 text-xs md:text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">주력 입시</span>
                <span className="font-semibold">{student.type}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">목표 대학</span>
                <span className="font-semibold text-right max-w-[120px] truncate">{student.target}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500">성향 분류</span>
                <span className="font-semibold text-indigo-600 text-right">{student.personality}</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('logs')}
              className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded text-xs md:text-sm font-semibold hover:bg-gray-200"
            >
              주간 점검 로그 보기
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const LogsView = () => (
    <div className="p-4 md:p-6 animate-in fade-in pb-24 md:pb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">주간 문제 해결 로그 (Action Log)</h2>
      
      <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-600 shadow-sm mb-4">
        <h3 className="text-sm md:text-md font-bold text-indigo-800 mb-3">신규 점검 결과 및 해결책 입력</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <select className="border rounded p-2 text-xs md:text-sm bg-gray-50 w-full outline-none">
            <option>학생 선택</option>
            {students.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
          <input type="text" placeholder="주차 (예: 2월 4주)" className="border rounded p-2 text-xs md:text-sm w-full outline-none" />
          <input type="number" placeholder="달성률 (%)" className="border rounded p-2 text-xs md:text-sm w-full outline-none" />
          <input type="date" className="border rounded p-2 text-xs md:text-sm w-full outline-none bg-white" />
        </div>
        <div className="space-y-2">
          <input type="text" placeholder="발생 문제 (Issue: 팩트 위주 기록)" className="w-full border rounded p-2 text-xs md:text-sm outline-none" />
          <input type="text" placeholder="근본 원인 (Root Cause: 구조적 원인 파악)" className="w-full border rounded p-2 text-xs md:text-sm bg-red-50 border-red-200 outline-none" />
          <input type="text" placeholder="해결책 (Action Item: 계획표 반영 사항)" className="w-full border rounded p-2 text-xs md:text-sm bg-blue-50 border-blue-200 font-semibold outline-none" />
        </div>
        <div className="mt-3 text-right">
          <button className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-indigo-700 text-xs md:text-sm">
            해결책 하달 및 저장
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto w-full">
        <table className="w-full text-xs md:text-sm text-left min-w-[700px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 w-20 whitespace-nowrap border-b">일자</th>
              <th className="py-2 px-3 w-20 whitespace-nowrap border-b">학생명</th>
              <th className="py-2 px-3 w-16 text-center whitespace-nowrap border-b">달성률</th>
              <th className="py-2 px-3 w-1/4 min-w-[150px] border-b">발생 문제 (Issue)</th>
              <th className="py-2 px-3 w-1/4 min-w-[150px] border-b">근본 원인 (Cause)</th>
              <th className="py-2 px-3 w-1/4 min-w-[150px] border-b">해결 지침 (Action Item)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-gray-50 align-top">
                <td className="py-2 px-3 text-[10px] md:text-xs text-gray-500 whitespace-nowrap">{log.date}</td>
                <td className="py-2 px-3 font-bold whitespace-nowrap">{log.student}</td>
                <td className="py-2 px-3 text-center whitespace-nowrap">
                  <span className={`font-bold ${log.achieve < 70 ? 'text-red-500' : 'text-green-500'}`}>{log.achieve}%</span>
                </td>
                <td className="py-2 px-3 text-gray-700">{log.issue}</td>
                <td className="py-2 px-3 text-red-600 font-medium">{log.rootCause}</td>
                <td className="py-2 px-3 text-blue-700 font-bold bg-blue-50/30">{log.solution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full font-sans text-gray-800 overflow-hidden relative">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex-none bg-slate-900 text-white p-4 flex justify-between items-center z-10 w-full">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-wider leading-none">고객 관리</h1>
            <p className="text-[10px] text-slate-400 mt-1">CRM SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-none bg-slate-900 text-slate-300 flex-col z-10 shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-black text-white tracking-wider">고객 관리</h1>
          <p className="text-xs text-slate-400 mt-1">CRM SYSTEM</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <BarChart3 size={18} /> 통합 대시보드
          </button>
          <button onClick={() => setActiveTab('funnel')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${activeTab === 'funnel' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <PhoneCall size={18} /> 전화통계/퍼널
          </button>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            메인 대시보드로 복귀
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative z-0 h-full">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'funnel' && <FunnelView />}
        {activeTab === 'crm' && <CRMView />}
        {activeTab === 'logs' && <LogsView />}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-20 pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}>
          <BarChart3 size={20} />
          <span className="text-[10px] mt-1 font-semibold">대시보드</span>
        </button>
        <button onClick={() => setActiveTab('funnel')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'funnel' ? 'text-blue-600' : 'text-gray-500'}`}>
          <PhoneCall size={20} />
          <span className="text-[10px] mt-1 font-semibold">퍼널관리</span>
        </button>
      </div>
    </div>
  );
}
