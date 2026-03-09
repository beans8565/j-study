"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDashboard, Student } from "@/components/providers/DashboardProvider"

export default function StudentsPage() {
  const { currentBranch, students: allStudents, setStudents, deleteStudent } = useDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({ name: "", grade: "고1", phone: "", parentPhone: "", type: "정시", target: "", program: "L" })

  const students = allStudents.filter(s => s.branch === currentBranch)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStudent) {
      setStudents(allStudents.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData }
          : s
      ))
      setIsEditOpen(false)
      setEditingStudent(null)
    } else {
      const newStudent: Student = {
        id: 'S' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        branch: currentBranch,
        name: formData.name,
        grade: formData.grade,
        phone: formData.phone,
        parentPhone: formData.parentPhone,
        target: formData.target,
        type: formData.type,
        personality: '분석필요',
        avgAchieve: 0,
        program: formData.program,
        status: 'none',
        checkIn: null,
        checkOut: null,
        seat: null,
        enrollmentStatus: '재원',
        periods: {},
        issue: null,
        tags: [],
        lastPlanStatus: 'unsubmitted',
        memo: '',
        penaltyPoints: 0,
        restTickets: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setStudents([...allStudents, newStudent])
      setIsOpen(false)
    }
    setFormData({ name: "", grade: "고1", phone: "", parentPhone: "", type: "정시", target: "", program: "L" })
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      grade: student.grade,
      phone: student.phone,
      parentPhone: student.parentPhone,
      type: student.type,
      target: student.target,
      program: student.program || "L"
    })
    setIsEditOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`${name} 학생의 데이터를 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      deleteStudent(id)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">학생 통합 관리</h1>
          <p className="text-sm text-slate-500 mt-1">{currentBranch} 재원생 목록입니다. 신규문의에서 등록 시 자동 추가됩니다.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
            신규 원생 직접 등록
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신규 원생 직접 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>학년</Label>
                  <select 
                    value={formData.grade} 
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="고3">고3</option>
                    <option value="고2">고2</option>
                    <option value="고1">고1</option>
                    <option value="N수">N수</option>
                    <option value="중3">중3</option>
                    <option value="중2">중2</option>
                    <option value="중1">중1</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>학생 연락처</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>학부모 연락처</Label>
                  <Input value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>전형</Label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="정시">정시</option>
                    <option value="수시(교과)">수시(교과)</option>
                    <option value="수시(학종)">수시(학종)</option>
                    <option value="논술">논술</option>
                    <option value="미정">미정</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>목표대학</Label>
                  <Input value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full">등록하기</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">이름</TableHead>
              <TableHead className="font-bold">학년</TableHead>
              <TableHead className="font-bold">전형/목표</TableHead>
              <TableHead className="font-bold">벌점/휴식권</TableHead>
              <TableHead className="font-bold">최근 성취도</TableHead>
              <TableHead className="font-bold">등록일</TableHead>
              <TableHead className="font-bold">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">등록된 재원생이 없습니다.</TableCell>
              </TableRow>
            ) : students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-bold text-slate-800">{student.name}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{student.program}</span>
                    <span className="text-sm">{student.type}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{student.target}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">벌점 {student.penaltyPoints}</span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">휴식 {student.restTickets}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${student.avgAchieve >= 80 ? 'bg-blue-500' : student.avgAchieve >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.avgAchieve}%` }}></div>
                    </div>
                    <span className="text-xs font-bold">{student.avgAchieve}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">{student.createdAt}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(student)}>상세/수정</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(student.id, student.name)}>삭제</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>학생 정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>학년</Label>
                <select 
                  value={formData.grade} 
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="고3">고3</option>
                  <option value="고2">고2</option>
                  <option value="고1">고1</option>
                  <option value="N수">N수</option>
                  <option value="중3">중3</option>
                  <option value="중2">중2</option>
                  <option value="중1">중1</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>학생 연락처</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>학부모 연락처</Label>
                <Input value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>전형</Label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="정시">정시</option>
                  <option value="수시(교과)">수시(교과)</option>
                  <option value="수시(학종)">수시(학종)</option>
                  <option value="논술">논술</option>
                  <option value="미정">미정</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>목표대학</Label>
                <Input value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>프로그램</Label>
              <select 
                value={formData.program} 
                onChange={(e) => setFormData({...formData, program: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="P">P (프리미엄)</option>
                <option value="S">S (스탠다드)</option>
                <option value="L">L (라이트)</option>
              </select>
            </div>
            <Button type="submit" className="w-full">저장하기</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
