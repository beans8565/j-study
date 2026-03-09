"use client"

import { useState, Fragment } from "react"
import { IconUsers, IconAlertTriangle, IconGrid, IconList, IconClock, IconSettings, IconTrash, IconRestore, IconPen } from "@/components/icons"

import { useDashboard } from "@/components/providers/DashboardProvider"

const TOTAL_SEATS = 89;
const PERIODS = ['0교시', '1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시'];
const PERIOD_STATUSES = ['미체크', '출석', '지각', '결석', '학원/과외', '학교', '가족일정', '휴식권', '기타'];

const generateEmptyPeriods = () => PERIODS.reduce((acc, p) => ({ ...acc, [p]: '미체크' }), {} as Record<string, string>);

const updateIssueString = (currentIssue: string | null, periodsArr: string[], newText: string | null, isClear = false) => {
    if (!currentIssue && isClear) return null;
    let issues = currentIssue ? currentIssue.split(' / ') : [];
    
    issues = issues.filter(item => {
        const match = item.match(/^\[(.*?)\]/);
        if (match) {
            const bracketText = match[1];
            const hasOverlap = periodsArr.some(p => {
                const pNum = p.replace('교시', '').trim();
                const bNums = bracketText.replace(/교시/g, '').split(',').map(s => s.trim());
                return bNums.includes(pNum);
            });
            return !hasOverlap; 
        }
        return true; 
    });

    if (!isClear && newText) {
        issues.push(newText);
    }

    return issues.length > 0 ? issues.join(' / ') : null;
};

const addOperationLog = (studentName: string, category: string, content: string, branch: string) => {
  try {
    const existing = localStorage.getItem('jstudy_operations');
    const logs = existing ? JSON.parse(existing) : [];
    const now = new Date();
    const newLog = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      studentName,
      category,
      content,
      response: '',
      isCompleted: false,
      branch
    };
    logs.unshift(newLog);
    localStorage.setItem('jstudy_operations', JSON.stringify(logs));
  } catch (e) {
    console.error(e);
  }
};

export default function AttendanceDashboard() {
  const { currentBranch, students: allStudents, setStudents } = useDashboard();
  const branchStudents = allStudents.filter(s => s.branch === currentBranch);
  
  const [viewMode, setViewMode] = useState('list');
  const [currentPeriod, setCurrentPeriod] = useState('2교시');
  
  const [modalState, setModalState] = useState({ isOpen: false, type: '', studentId: null as string | null, period: null as string | null, selectedPeriods: [] as string[], val1: '', val2: '' });
  const [editIssueModal, setEditIssueModal] = useState({ isOpen: false, studentId: null as string | null, text: '' });
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('active'); 
  const [newStudent, setNewStudent] = useState({ name: '', grade: '고1', program: 'L', seat: '' });
  const [settingsError, setSettingsError] = useState('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeStudents = branchStudents.filter(s => s.enrollmentStatus === '재원');
  const archivedStudents = branchStudents.filter(s => s.enrollmentStatus === '퇴소');

  const handlePeriodChange = (id: string, period: string, newStatus: string) => {
    if (newStatus === '지각') { setModalState({ isOpen: true, type: 'late', studentId: id, period, selectedPeriods: [period], val1: '', val2: '' }); return; } 
    else if (newStatus === '학원/과외') { setModalState({ isOpen: true, type: 'academy', studentId: id, period, selectedPeriods: [period], val1: '', val2: '' }); return; } 
    else if (newStatus === '기타') { setModalState({ isOpen: true, type: 'other', studentId: id, period, selectedPeriods: [period], val1: '', val2: '' }); return; }

    setStudents(allStudents.map(s => {
      if (s.id === id) {
        let updates: any = { periods: { ...s.periods, [period]: newStatus } };
        let historyEntry = null;

        if (['학교', '가족일정', '결석', '휴식권'].includes(newStatus)) {
          updates.issue = updateIssueString(s.issue, [period], `[${period}] ${newStatus}`, false);
          addOperationLog(s.name, newStatus === '결석' ? '결석' : '출결/동선', `[${period}] ${newStatus}`, currentBranch);
          
          if (newStatus === '휴식권') {
            updates.restTickets = (s.restTickets || 0) - 1;
            historyEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              type: 'rest',
              reason: `휴식권 사용 (${period})`,
              effectDemerit: 0,
              effectRest: -1,
              note: '[출결 시스템 연동] 정규 교시 휴식권 1장 자동 차감'
            };
          } else if (newStatus === '결석') {
            const savedRules = localStorage.getItem('jstudy_rules');
            const rules = savedRules ? JSON.parse(savedRules) : [];
            const absRule = rules.find((r:any) => r.name.includes('결석'));
            if (absRule) {
              updates.penaltyPoints = Math.max(0, (s.penaltyPoints || 0) + absRule.demerit);
              updates.restTickets = (s.restTickets || 0) + absRule.rest;
              historyEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                type: 'rule',
                reason: absRule.name,
                effectDemerit: absRule.demerit,
                effectRest: absRule.rest,
                note: `[출결 시스템 연동] 결석 자동 규정 적용`
              };
            }
          }
        } else if (newStatus === '출석' || newStatus === '미체크') {
          updates.issue = updateIssueString(s.issue, [period], null, true);
        }

        if (historyEntry) {
          updates.demeritHistory = [historyEntry, ...(s.demeritHistory || [])];
        }

        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const toggleModalPeriod = (p: string) => {
    setModalState(prev => {
      const isSelected = prev.selectedPeriods.includes(p);
      const newPeriods = isSelected 
        ? prev.selectedPeriods.filter(sp => sp !== p) 
        : [...prev.selectedPeriods, p];
      return { ...prev, selectedPeriods: newPeriods };
    });
  };

  const submitModalData = () => {
    const { type, studentId, selectedPeriods, val1, val2 } = modalState;
    if (selectedPeriods.length === 0) {
      alert("적용할 교시를 최소 1개 이상 선택해야 합니다."); 
      return;
    }

    let finalStatus = '', newEntry = '';
    
    const sortedPeriods = [...selectedPeriods].sort((a, b) => PERIODS.indexOf(a) - PERIODS.indexOf(b));
    const periodLabel = sortedPeriods.map(p => p.replace('교시', '')).join(',') + '교시';

    if (type === 'late') { if (!val1) return; finalStatus = '지각'; newEntry = `[${periodLabel}] 지각 (${val1}분)`; } 
    else if (type === 'academy') { if (!val1 || !val2) return; finalStatus = '학원/과외'; newEntry = `[${periodLabel}] 학원/과외 (${val1} ~ ${val2})`; } 
    else if (type === 'other') { if (!val1.trim()) return; finalStatus = '기타'; newEntry = `[${periodLabel}] 기타 - ${val1}`; }

    const st = allStudents.find(s => s.id === studentId);
    if (st) {
      addOperationLog(st.name, finalStatus === '지각' ? '지각' : '출결/동선', newEntry, currentBranch);
    }

    setStudents(allStudents.map(s => {
      if (s.id === studentId) {
        const updatedPeriods = { ...(s.periods || {}) };
        sortedPeriods.forEach(p => {
          updatedPeriods[p] = finalStatus;
        });
        const updatedIssue = updateIssueString(s.issue, sortedPeriods, newEntry, false);
        
        let extraUpdates: any = {};
        if (finalStatus === '지각') {
          const mins = parseInt(val1, 10);
          const savedRules = localStorage.getItem('jstudy_rules');
          const rules = savedRules ? JSON.parse(savedRules) : [];
          
          let ruleToApply = null;
          if (mins >= 1 && mins <= 4) ruleToApply = rules.find((r:any) => r.name.includes('1~4분'));
          else if (mins >= 5 && mins <= 29) ruleToApply = rules.find((r:any) => r.name.includes('5~29분'));
          else if (mins >= 30) ruleToApply = rules.find((r:any) => r.name.includes('30분'));

          if (ruleToApply) {
            extraUpdates.penaltyPoints = Math.max(0, (s.penaltyPoints || 0) + ruleToApply.demerit);
            extraUpdates.restTickets = (s.restTickets || 0) + ruleToApply.rest;
            const historyEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              type: 'rule',
              reason: ruleToApply.name,
              effectDemerit: ruleToApply.demerit,
              effectRest: ruleToApply.rest,
              note: `[출결 시스템 연동] 지각(${mins}분) 자동 규정 적용`
            };
            extraUpdates.demeritHistory = [historyEntry, ...(s.demeritHistory || [])];
          }
        }

        return { ...s, periods: updatedPeriods, issue: updatedIssue, ...extraUpdates };
      }
      return s;
    }));
    closeModal();
  };

  const closeModal = () => setModalState({ isOpen: false, type: '', studentId: null, period: null, selectedPeriods: [], val1: '', val2: '' });

  const handleEditIssueSave = () => {
    setStudents(allStudents.map(s => 
      s.id === editIssueModal.studentId 
        ? { ...s, issue: editIssueModal.text.trim() || null }
        : s
    ));
    setEditIssueModal({ isOpen: false, studentId: null, text: '' });
  };

  const handleAddStudent = () => {
    setSettingsError('');
    const seatNum = parseInt(newStudent.seat, 10);
    
    if (!newStudent.name.trim()) return setSettingsError('학생 이름을 입력하세요.');
    if (isNaN(seatNum) || seatNum < 1 || seatNum > TOTAL_SEATS) return setSettingsError(`좌석 번호는 1~${TOTAL_SEATS} 사이여야 합니다.`);
    if (activeStudents.some(s => s.seat === seatNum)) return setSettingsError(`${seatNum}번 좌석은 이미 사용 중입니다.`);

    const newId = 'S' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const newStudentObj = {
      id: newId,
      branch: currentBranch,
      name: newStudent.name.trim(),
      grade: newStudent.grade,
      phone: '',
      parentPhone: '',
      target: '미정',
      type: '미정',
      program: newStudent.program,
      personality: '분석필요',
      avgAchieve: 0,
      seat: seatNum,
      enrollmentStatus: '재원' as '재원' | '퇴소',
      periods: generateEmptyPeriods(),
      issue: null,
      status: 'none' as any,
      checkIn: null,
      checkOut: null,
      tags: [],
      lastPlanStatus: 'unsubmitted' as any,
      memo: '',
      penaltyPoints: 0,
      restTickets: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setStudents([...allStudents, newStudentObj]);
    setNewStudent({ name: '', grade: '고1', program: 'L', seat: '' });
  };

  const handleUpdateStudent = (id: string, field: string, value: any) => {
    setSettingsError('');
    
    if (field === 'seat') {
      if (value === '') {
        setStudents(allStudents.map(s => s.id === id ? { ...s, seat: null } : s));
        return;
      }
      const seatNum = parseInt(value, 10);
      if (isNaN(seatNum) || seatNum < 1 || seatNum > TOTAL_SEATS) return;
      
      if (activeStudents.some(s => s.id !== id && s.seat === seatNum)) {
         setSettingsError(`${seatNum}번 좌석은 다른 재원생이 배정되어 있어 이동할 수 없습니다.`);
         return;
      }
      setStudents(allStudents.map(s => s.id === id ? { ...s, seat: seatNum } : s));
    } else {
      setStudents(allStudents.map(s => s.id === id ? { ...s, [field]: value } : s));
    }
  };

  const handleDischargeStudent = (id: string) => {
    setStudents(allStudents.map(s => s.id === id ? { ...s, enrollmentStatus: '퇴소', seat: null } : s));
  };

  const handleRestoreStudent = (id: string) => {
    setStudents(allStudents.map(s => s.id === id ? { ...s, enrollmentStatus: '재원', seat: null } : s));
    setSettingsTab('active');
  };

  const executeDeleteStudent = () => {
    if (deleteConfirmId !== null) {
      setStudents(allStudents.filter(s => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const getPeriodBadge = (status: string) => {
    switch(status) {
      case '출석': return 'bg-green-50 text-green-700 border-green-200';
      case '지각': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case '결석': return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case '학원/과외': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '학교': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '가족일정': return 'bg-orange-50 text-orange-700 border-orange-200';
      case '휴식권': return 'bg-pink-50 text-pink-700 border-pink-200';
      case '기타': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-white text-slate-400 border-slate-200 border-dashed';
    }
  };

  const getProgramBadge = (program: string) => {
    switch(program) {
      case 'L': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'S': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'P': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSeatContent = (seatNum: number) => {
    const student = activeStudents.find(s => s.seat === seatNum);
    if (!student) return { isEmpty: true };
    
    const periodStatus = student.periods[currentPeriod];
    let bgColor = 'bg-slate-100', borderColor = 'border-slate-300', textColor = 'text-slate-600';
    
    if (periodStatus === '출석') { bgColor = 'bg-green-100'; borderColor = 'border-green-400'; textColor = 'text-green-800'; } 
    else if (periodStatus === '결석') { bgColor = 'bg-red-100'; borderColor = 'border-red-500'; textColor = 'text-red-800'; } 
    else if (['학원/과외', '학교', '가족일정', '기타', '휴식권'].includes(periodStatus)) { bgColor = 'bg-slate-200 opacity-60'; borderColor = 'border-slate-400'; textColor = 'text-slate-600'; } 
    else if (periodStatus === '지각') { bgColor = 'bg-yellow-100'; borderColor = 'border-yellow-400'; textColor = 'text-yellow-800'; } 
    else if (periodStatus === '미체크') { bgColor = 'bg-white'; borderColor = 'border-slate-300 border-dashed'; }

    return { isEmpty: false, student, periodStatus, bgColor, borderColor, textColor };
  };

  const seatArray = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);

  return (
    <div className="pb-10 relative text-slate-900 font-sans">
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <IconAlertTriangle size={24} />
              <h3 className="text-lg font-bold">데이터 영구 삭제</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              해당 학생의 모든 누적 데이터(출결, 이석 시간 등)가 영구적으로 삭제됩니다. 계속하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">취소</button>
              <button onClick={executeDeleteStudent} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">영구 삭제</button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><IconSettings size={24} /> 전체 학생 데이터 관리</h2>
                <p className="text-sm text-slate-500 mt-1">현장 운용(등록/자리배정/퇴소) 및 누적 데이터 보관 기능을 제공합니다.</p>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="flex px-6 pt-4 border-b border-slate-200 bg-white">
              <button 
                onClick={() => setSettingsTab('active')} 
                className={`pb-3 px-4 text-sm font-bold transition-colors ${settingsTab === 'active' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                재원생 관리 ({activeStudents.length}명)
              </button>
              <button 
                onClick={() => setSettingsTab('archived')} 
                className={`pb-3 px-4 text-sm font-bold transition-colors ${settingsTab === 'archived' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                퇴소생 보관함 ({archivedStudents.length}명)
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {settingsTab === 'active' && (
                <Fragment>
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">신규 학생 등록</h3>
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">이름</label>
                        <input type="text" className="border border-slate-300 rounded px-3 py-1.5 text-sm w-32 focus:ring-1 focus:ring-blue-500" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="이름" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">학년</label>
                        <select className="border border-slate-300 rounded px-3 py-1.5 text-sm w-24" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                          <option>고1</option><option>고2</option><option>고3</option><option>N수</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">프로그램</label>
                        <select className="border border-slate-300 rounded px-3 py-1.5 text-sm w-20" value={newStudent.program} onChange={e => setNewStudent({...newStudent, program: e.target.value})}>
                          <option>L</option><option>S</option><option>P</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">배정 좌석 (1~89)</label>
                        <input type="number" min="1" max="89" className="border border-slate-300 rounded px-3 py-1.5 text-sm w-32 focus:ring-1 focus:ring-blue-500 font-mono" value={newStudent.seat} onChange={e => setNewStudent({...newStudent, seat: e.target.value})} placeholder="번호 입력" />
                      </div>
                      <button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
                        명부 등록
                      </button>
                    </div>
                    {settingsError && <p className="text-red-500 text-xs font-semibold mt-3 bg-red-50 p-2 rounded border border-red-100">{settingsError}</p>}
                  </div>

                  <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">현재 재원생 리스트 및 좌석 이동</h3>
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3 w-20">좌석 번호</th>
                          <th className="px-4 py-3">학생 이름</th>
                          <th className="px-4 py-3 w-24">학년</th>
                          <th className="px-4 py-3 w-24">프로그램</th>
                          <th className="px-4 py-3 w-28 text-center">보관함 이동</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...activeStudents].sort((a,b) => (Number(a.seat) || 999) - (Number(b.seat) || 999)).map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2">
                              <input type="number" min="1" max="89" 
                                className="w-16 border border-slate-300 rounded px-2 py-1 font-mono text-center focus:ring-1 focus:ring-blue-500" 
                                value={s.seat || ''} 
                                onChange={e => handleUpdateStudent(s.id, 'seat', e.target.value)} 
                                placeholder="공석"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" className="w-32 border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500" 
                                value={s.name} onChange={e => handleUpdateStudent(s.id, 'name', e.target.value)} />
                            </td>
                            <td className="px-4 py-2">
                              <select className="border border-slate-300 rounded px-2 py-1 w-full" value={s.grade} onChange={e => handleUpdateStudent(s.id, 'grade', e.target.value)}>
                                <option>고1</option><option>고2</option><option>고3</option><option>N수</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select className="border border-slate-300 rounded px-2 py-1 w-full" value={s.program} onChange={e => handleUpdateStudent(s.id, 'program', e.target.value)}>
                                <option>L</option><option>S</option><option>P</option>
                              </select>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button onClick={() => handleDischargeStudent(s.id)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded border border-slate-300 transition-colors font-semibold" title="퇴소 처리 (보관함으로 이동)">
                                퇴소 처리
                              </button>
                            </td>
                          </tr>
                        ))}
                        {activeStudents.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-500">재원생이 없습니다.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              )}

              {settingsTab === 'archived' && (
                <Fragment>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm mb-6">
                    <h3 className="text-sm font-bold text-blue-800">퇴소생 누적 데이터 보관함</h3>
                    <p className="text-xs text-blue-700 mt-1">이곳의 데이터는 대시보드(리스트/좌석표)에 노출되지 않습니다. 과거 이력 확인 및 재등록 처리를 위해 활용하십시오.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-4 py-3">학생 이름</th>
                          <th className="px-4 py-3 w-20 text-center">학년</th>
                          <th className="px-4 py-3 w-20 text-center">프로그램</th>
                          <th className="px-4 py-3 w-64">최근 기록 (이탈/비고)</th>
                          <th className="px-4 py-3 w-32 text-center">재등록 / 영구삭제</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {archivedStudents.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800">{s.name}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{s.grade}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getProgramBadge(s.program)}`}>{s.program}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {s.issue ? <span className="bg-slate-100 px-2 py-1 rounded">{s.issue}</span> : '기록 없음'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleRestoreStudent(s.id)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors" title="재원생으로 복구 (자리 재배정 필요)">
                                  <IconRestore size={18} />
                                </button>
                                <button onClick={() => setDeleteConfirmId(s.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title="데이터 영구 삭제">
                                  <IconTrash size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {archivedStudents.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-500">보관된 퇴소생 데이터가 없습니다.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      )}

      {modalState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[80]">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              {modalState.type === 'late' && <IconClock size={20} className="text-yellow-600"/>}
              {modalState.type === 'late' ? '지각 시간 기록' : 
               modalState.type === 'academy' ? '학원/과외 이석 기록' : '기타 사유 작성'}
            </h3>
            <p className="text-sm text-slate-500 mb-4 border-b pb-3">
              단일 또는 연속된 교시의 학습 누수 시간을 일괄 적용합니다.
            </p>
            
            <div className="mb-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">적용할 교시 선택 (연속 선택 가능)</label>
                <div className="flex flex-wrap gap-1.5">
                  {PERIODS.map(p => (
                    <button
                      key={p}
                      onClick={() => toggleModalPeriod(p)}
                      className={`px-2 py-1 text-[11px] font-bold rounded border transition-colors ${
                        modalState.selectedPeriods.includes(p) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {modalState.type === 'late' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">총 지각 시간 (분 단위)</label>
                  <div className="relative">
                    <input type="number" min="1" autoFocus className="w-full border border-slate-300 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" value={modalState.val1} onChange={(e) => setModalState({...modalState, val1: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') submitModalData(); }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">분</span>
                  </div>
                </div>
              )}
              {modalState.type === 'academy' && (
                <div className="flex items-center gap-2">
                  <div className="flex-1"><label className="block text-xs font-bold text-slate-600 mb-1">이석 (출발) 시간</label><input type="time" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500" value={modalState.val1} onChange={(e) => setModalState({...modalState, val1: e.target.value})} /></div>
                  <span className="text-slate-400 font-bold mt-5">~</span>
                  <div className="flex-1"><label className="block text-xs font-bold text-slate-600 mb-1">등원 (복귀) 시간</label><input type="time" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500" value={modalState.val2} onChange={(e) => setModalState({...modalState, val2: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') submitModalData(); }} /></div>
                </div>
              )}
              {modalState.type === 'other' && (
                <div><label className="block text-xs font-bold text-slate-600 mb-1">구체적 사유</label><input type="text" autoFocus className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" value={modalState.val1} onChange={(e) => setModalState({...modalState, val1: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') submitModalData(); }} /></div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">취소</button>
              <button onClick={submitModalData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50" disabled={modalState.selectedPeriods.length === 0}>일괄 기록 저장</button>
            </div>
          </div>
        </div>
      )}

      {editIssueModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[85]">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <IconPen size={20} className="text-blue-600" />
              학습 누수 기록 수정
            </h3>
            <p className="text-sm text-slate-500 mb-4 border-b pb-3">
              기록된 시간 또는 사유를 텍스트로 직접 수정합니다.
            </p>
            <input 
              type="text" 
              autoFocus
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 font-medium text-slate-700"
              value={editIssueModal.text}
              onChange={(e) => setEditIssueModal({...editIssueModal, text: e.target.value})}
              onKeyDown={(e) => { if(e.key === 'Enter') handleEditIssueSave(); }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditIssueModal({ isOpen: false, studentId: null, text: '' })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">취소</button>
              <button onClick={handleEditIssueSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">수정 완료</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><IconUsers size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">제이스터디 출결·좌석 관리</h1>
            <p className="text-sm text-slate-500">학습 누수 시간 분석 시스템</p>
          </div>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <IconList size={16} /> 리스트
            </button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <IconGrid size={16} /> 좌석표
            </button>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <IconSettings size={18} /> <span className="hidden sm:inline">관리설정</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6 mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex gap-3 items-center">
            <span className="text-sm font-bold text-slate-700">점검 기준 교시:</span>
            <select 
              className="pl-3 pr-8 py-1.5 border border-blue-300 rounded-lg text-sm font-bold text-blue-700 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentPeriod}
              onChange={(e) => setCurrentPeriod(e.target.value)}
            >
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {viewMode === 'map' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {seatArray.map(seatNum => {
                const seatData = getSeatContent(seatNum);
                if (seatData.isEmpty) return <div key={seatNum} className="aspect-square bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-300 opacity-60"><span className="text-xs font-mono">{seatNum}</span></div>;
                return (
                  <div key={seatNum} className={`aspect-square border-2 rounded-lg p-2 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer ${seatData.bgColor} ${seatData.borderColor}`}
                    onClick={() => {
                      if (seatData.student) {
                        handlePeriodChange(seatData.student.id, currentPeriod, seatData.periodStatus === '출석' ? '결석' : '출석')
                      }
                    }}
                  >
                    <div className="flex gap-1 items-start">
                      <span className="text-[10px] font-bold text-slate-500 bg-white/50 px-1 rounded w-fit">{seatNum}</span>
                      {seatData.student && <span className={`text-[9px] font-bold px-1 rounded-sm border ${getProgramBadge(seatData.student.program)}`}>{seatData.student.program}</span>}
                    </div>
                    <div className="text-center">
                      <div className={`font-bold text-sm ${seatData.textColor}`}>{seatData.student?.name}</div>
                      <div className="text-[10px] font-medium opacity-80 mt-1 leading-tight">{seatData.periodStatus}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-max">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap w-16">좌석</th>
                    <th className="px-4 py-4 whitespace-nowrap">학생 정보</th>
                    {PERIODS.map(p => (
                      <th key={p} className={`px-2 py-4 whitespace-nowrap text-center ${p === currentPeriod ? 'bg-blue-50 text-blue-700 font-bold' : ''}`}>{p}</th>
                    ))}
                    <th className="px-4 py-4 whitespace-nowrap w-72">학습 누수 / 사유 분석</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...activeStudents].sort((a,b) => (Number(a.seat) || 999) - (Number(b.seat) || 999)).map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-500">{student.seat}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{student.name}</span>
                          <span className="text-xs font-normal text-slate-500">{student.grade}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getProgramBadge(student.program)}`}>{student.program}</span>
                        </div>
                      </td>
                      {PERIODS.map(period => (
                        <td key={period} className={`px-1 py-3 text-center ${period === currentPeriod ? 'bg-blue-50/30' : ''}`}>
                          <select
                            className={`text-center text-[11px] font-medium px-1 py-1 rounded border cursor-pointer focus:outline-none w-[72px] ${getPeriodBadge(student.periods[period])}`}
                            value={student.periods[period]}
                            onChange={(e) => handlePeriodChange(student.id, period, e.target.value)}
                          >
                            {PERIOD_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {student.issue ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 pl-2.5 pr-1 py-1 rounded-md border border-slate-200 max-w-full">
                            <IconAlertTriangle size={12} className="text-slate-500 shrink-0" />
                            <span className="truncate" title={student.issue}>{student.issue}</span>
                            <button 
                              onClick={() => setEditIssueModal({ isOpen: true, studentId: student.id, text: student.issue! })}
                              className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded p-1 ml-1 transition-colors shrink-0"
                              title="기록 수정"
                            >
                              <IconPen size={10} />
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {activeStudents.length === 0 && <tr><td colSpan={3 + PERIODS.length} className="text-center py-10 text-slate-500">운용 중인 재원생 데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
