"use client"
import DashboardNav from "@/components/layout/DashboardNav"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { usePathname } from "next/navigation"
import { DashboardProvider } from "@/components/providers/DashboardProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isCrm = pathname === '/dashboard/crm'

  if (isCrm) {
    return (
      <DashboardProvider>
        <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </DashboardProvider>
    )
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-[#f1f5f9] text-slate-800 font-sans">
        <DashboardNav />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <DashboardHeader />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}
