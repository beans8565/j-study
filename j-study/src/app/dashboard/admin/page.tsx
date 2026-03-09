"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCog, Plus, Trash2, Mail, Phone, ShieldCheck } from "lucide-react"

type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  role: string // '최고관리자' | '지점관리자'
  branch: string
}

export default function AdminPage() {
  const { currentBranch } = useDashboard()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  
  // New Admin Form State
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newRole, setNewRole] = useState("지점관리자")

  useEffect(() => {
    const saved = localStorage.getItem('jstudy_admins')
    if (saved) {
      setAdmins(JSON.parse(saved))
    } else {
      setAdmins([
        { id: 'admin_1', name: '대표 원장', email: 'master@jstudy.com', phone: '010-1234-5678', role: '최고관리자', branch: '전체' },
        { id: 'admin_2', name: '사우점 실장', email: 'sau@jstudy.com', phone: '010-2345-6789', role: '지점관리자', branch: '사우점' },
        { id: 'admin_3', name: '목동점 실장', email: 'mokdong@jstudy.com', phone: '010-3456-7890', role: '지점관리자', branch: '목동점' },
      ])
    }
  }, [])

  useEffect(() => {
    if (admins.length > 0) {
      localStorage.setItem('jstudy_admins', JSON.stringify(admins))
    }
  }, [admins])

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      role: newRole,
      branch: newRole === '최고관리자' ? '전체' : currentBranch
    }

    setAdmins([...admins, newAdmin])
    setNewName("")
    setNewEmail("")
    setNewPhone("")
    setNewRole("지점관리자")
    setIsAdding(false)
  }

  const handleDeleteAdmin = (id: string) => {
    if (confirm("정말로 이 관리자를 삭제하시겠습니까?")) {
      setAdmins(admins.filter(a => a.id !== id))
    }
  }

  const filteredAdmins = admins.filter(a => a.role === '최고관리자' || a.branch === currentBranch)

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCog className="text-blue-600" />
            관리자 설정
          </h1>
          <p className="text-sm text-slate-500 mt-1">시스템을 관리할 최고관리자 및 지점별 관리자를 추가하고 권한을 설정합니다.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 gap-2"
        >
          {isAdding ? "취소" : <><Plus size={18} /> 관리자 추가</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-500" />
            신규 관리자 등록
          </h2>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">이름</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="홍길동" required className="bg-slate-50 border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">이메일 (로그인 ID)</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@jstudy.com" required className="bg-slate-50 border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">연락처</label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="010-0000-0000" className="bg-slate-50 border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">권한</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="지점관리자">지점관리자 ({currentBranch})</option>
                <option value="최고관리자">최고관리자 (전체 지점)</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-2">
              <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-11">
                관리자 계정 생성
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-slate-200">
              <TableHead className="font-bold text-slate-700">관리자명</TableHead>
              <TableHead className="font-bold text-slate-700">담당 지점</TableHead>
              <TableHead className="font-bold text-slate-700">권한</TableHead>
              <TableHead className="font-bold text-slate-700">연락처</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id} className="border-b-slate-100 hover:bg-slate-50/50">
                <TableCell className="font-bold text-slate-800">
                  <div className="flex flex-col">
                    <span>{admin.name}</span>
                    <span className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                      <Mail size={10} /> {admin.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${admin.branch === '전체' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {admin.branch}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${admin.role === '최고관리자' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {admin.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600 flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    {admin.phone || "-"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}