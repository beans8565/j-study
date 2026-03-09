"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Branch = '사우점' | '목동점';

export type Lead = {
  id: string;
  branch: Branch;
  date: string;
  bookedDate: string;
  name: string;
  grade: string;
  path: string;
  status: string;
  note: string;
  reason: string;
};

export type Student = {
  id: string;
  branch: Branch;
  name: string;
  grade: string;
  phone: string;
  parentPhone: string;
  target: string;
  type: string;
  personality: string;
  avgAchieve: number;
  program: string; // P, S, L
  
  // Attendance & Seats
  enrollmentStatus: '재원' | '퇴소';
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'none';
  checkIn: string | null;
  checkOut: string | null;
  seat: number | null;
  periods: Record<string, string>;
  issue: string | null;
  
  // Tags & Management
  tags: string[];
  lastPlanStatus: 'submitted' | 'unsubmitted' | 'pending';
  memo: string;
  
  // Penalty & Rest
  penaltyPoints: number;
  restTickets: number;
  
  createdAt: string;
};

type DashboardContextType = {
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  updateLeadStatus: (id: string, newStatus: string) => void;
  deleteLead: (id: string) => void;
  deleteStudent: (id: string) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch>('사우점');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedBranch = localStorage.getItem('jstudy_branch') as Branch;
    if (savedBranch) setCurrentBranch(savedBranch);
    
    const savedLeads = localStorage.getItem('jstudy_leads');
    if (savedLeads) setLeads(JSON.parse(savedLeads));
    else setLeads([
      { id: 'L001', branch: '사우점', date: '2026-02-21', bookedDate: '2026-02-23T14:00', name: '김지훈', grade: '고2', path: '지인소개', status: '체험중', note: '수학 선행 부족', reason: '' },
      { id: 'L002', branch: '사우점', date: '2026-02-22', bookedDate: '2026-02-24T16:30', name: '이수아', grade: '고3', path: '블로그', status: '이탈(종료)', reason: '비용 저항감', note: '' },
      { id: 'L003', branch: '목동점', date: '2026-02-23', bookedDate: '2026-02-27T18:00', name: '박민준', grade: '고1', path: '검색광고', status: '상담예약', note: '학습습관 미형성', reason: '' },
      { id: 'L004', branch: '사우점', date: '2026-02-24', bookedDate: '2026-02-25T19:00', name: '최윤진', grade: '고2', path: '지인소개', status: '최종등록', note: '정시 올인 희망', reason: '' },
    ]);

    const savedStudents = localStorage.getItem('jstudy_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    else setStudents([
      { 
        id: 'S001', branch: '사우점', name: '최윤진', grade: '고2', phone: '010-1234-5678', parentPhone: '010-8765-4321', target: '성균관대', type: '정시', personality: '고집형/계획오류', avgAchieve: 85, program: 'P',
        enrollmentStatus: '재원', status: 'present', checkIn: '16:00', checkOut: null, seat: 12, periods: { '1교시': '출석', '2교시': '출석' }, issue: null, tags: ['집중력부족'], lastPlanStatus: 'submitted', memo: '', penaltyPoints: 2, restTickets: 1, createdAt: '2026-02-25'
      },
      { 
        id: 'S002', branch: '사우점', name: '정현우', grade: '고3', phone: '010-1111-2222', parentPhone: '010-3333-4444', target: '한양대', type: '교과/학종', personality: '의존형/실행부족', avgAchieve: 55, program: 'S',
        enrollmentStatus: '재원', status: 'absent', checkIn: null, checkOut: null, seat: 5, periods: { '0교시': '가족일정', '1교시': '가족일정', '2교시': '결석', '3교시': '결석' }, issue: '[0교시] 가족일정', tags: ['스마트폰주의'], lastPlanStatus: 'unsubmitted', memo: '수학학원 보충', penaltyPoints: 5, restTickets: 2, createdAt: '2026-01-15'
      },
      { 
        id: 'S003', branch: '목동점', name: '강서연', grade: '고1', phone: '010-5555-6666', parentPhone: '010-7777-8888', target: '미정', type: '학종', personality: '자기주도형', avgAchieve: 92, program: 'L',
        enrollmentStatus: '재원', status: 'none', checkIn: null, checkOut: null, seat: null, periods: {}, issue: null, tags: ['우수생'], lastPlanStatus: 'pending', memo: '', penaltyPoints: 0, restTickets: 5, createdAt: '2026-02-01'
      }
    ]);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jstudy_branch', currentBranch);
      localStorage.setItem('jstudy_leads', JSON.stringify(leads));
      localStorage.setItem('jstudy_students', JSON.stringify(students));
    }
  }, [currentBranch, leads, students, isLoaded]);

  const updateLeadStatus = (id: string, newStatus: string) => {
    setLeads(prevLeads => {
      const updatedLeads = prevLeads.map(lead => 
        lead.id === id ? { ...lead, status: newStatus } : lead
      );
      
      // If status changed to 최종등록, automatically add to students if not exists
      if (newStatus === '최종등록') {
        const leadToEnroll = updatedLeads.find(l => l.id === id);
        if (leadToEnroll) {
          setStudents(prev => {
            // Check if already exists in the same branch
            if (prev.some(s => s.name === leadToEnroll.name && s.grade === leadToEnroll.grade && s.branch === leadToEnroll.branch)) {
              return prev;
            }
            const newStudent: Student = {
              id: 'S' + Math.random().toString(36).substring(2, 6).toUpperCase(),
              branch: leadToEnroll.branch,
              name: leadToEnroll.name,
              grade: leadToEnroll.grade,
              phone: '',
              parentPhone: '',
              target: '상담 후 결정',
              type: '미정',
              personality: '분석필요',
              avgAchieve: 0,
              program: 'S',
              status: 'none',
              checkIn: null,
              checkOut: null,
              seat: null,
              enrollmentStatus: '재원',
              periods: {},
              issue: null,
              tags: ['신규등록'],
              lastPlanStatus: 'unsubmitted',
              memo: leadToEnroll.note,
              penaltyPoints: 0,
              restTickets: 0,
              createdAt: new Date().toISOString().split('T')[0]
            };
            return [...prev, newStudent];
          });
        }
      }
      return updatedLeads;
    });
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-[#f1f5f9]"></div>;

  return (
    <DashboardContext.Provider value={{ currentBranch, setCurrentBranch, leads, setLeads, students, setStudents, updateLeadStatus, deleteLead, deleteStudent }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}
