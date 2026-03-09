"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { 
  PieChart, 
  Users, 
  ClipboardList, 
  CalendarCheck, 
  FileSignature, 
  PhoneCall, 
  Clock, 
  Ticket,
  LogOut,
  FileText,
  UserCog
} from "lucide-react"

export default function DashboardNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // CRM 페이지에서는 자체 사이드바를 쓰므로 렌더링 안함
  if (pathname === '/dashboard/crm') {
    return null
  }

  const mainNavItems = [
    { name: "대시보드", href: "/dashboard", icon: PieChart },
    { name: "학생 통합 관리", href: "/dashboard/students", icon: Users },
    { name: "성향 진단 & 태그", href: "/dashboard/diagnosis", icon: ClipboardList },
    { name: "스케줄 관리", href: "/dashboard/schedule", icon: CalendarCheck },
    { name: "점검 및 리포트", href: "/dashboard/reports", icon: FileSignature },
  ]

  const opNavItems = [
    { name: "신규 문의 & CRM", href: "/dashboard/crm", icon: PhoneCall },
    { name: "출결 및 동선 관리", href: "/dashboard/attendance", icon: Clock },
    { name: "운영 및 특이사항", href: "/dashboard/operations", icon: FileText },
    { name: "벌점 및 휴식권 관리", href: "/dashboard/demerit", icon: Ticket },
    { name: "관리자 설정", href: "/dashboard/admin", icon: UserCog },
  ]

  const handleNavClick = (e: React.MouseEvent, alertMsg?: string) => {
    if (alertMsg) {
      e.preventDefault();
      alert(alertMsg);
    }
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 shrink-0 min-h-screen">
      <div className="p-6 border-b border-slate-800 text-center">
        <Link href="/dashboard">
          <h1 className="text-2xl font-black tracking-tighter text-blue-500">J.STUDY</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">EduConsult Pro</p>
        </Link>
      </div>
      
      {session?.user?.role === "ADMIN" && (
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={(e) => handleNavClick(e, (item as any).alert)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Icon className="w-5 text-center" size={18} />
                {item.name}
              </Link>
            )
          })}

          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">운영 관리 (Operation)</p>
          </div>

          {opNavItems.map((item) => {
            const Icon = item.icon
            // crm이나 attendance 등 각 메뉴의 고유 href에만 불이 들어오게 함.
            const isActive = pathname === item.href
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={(e) => handleNavClick(e, (item as any).alert)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Icon className="w-5 text-center" size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      )}

      {session && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl transition-colors hover:bg-slate-800 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-inner text-white">
                {session.user.name?.charAt(0) || "김"}
              </div>
              <div>
                <div className="text-sm font-bold leading-tight text-white">{session.user.name || "김제이 실장"}</div>
                <div className="text-[10px] text-slate-400">최고 관리자</div>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
