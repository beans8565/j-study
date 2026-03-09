"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function InquiryPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to backend API to save reservation
    alert("상담 예약이 신청되었습니다. 담당자가 확인 후 연락드리겠습니다.")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b">
        <Link className="flex items-center justify-center font-bold text-xl" href="/">
          J-Study
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">상담 예약</CardTitle>
            <CardDescription>
              제이스터디에 대한 궁금한 점이나 상담을 원하시면 아래 양식을 작성해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 (학생 또는 학부모)</Label>
                <Input id="name" placeholder="홍길동" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input id="phone" type="tel" placeholder="010-0000-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">희망 상담일자</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">문의 내용</Label>
                <Textarea 
                  id="message" 
                  placeholder="현재 학년, 궁금한 사항 등을 자유롭게 적어주세요." 
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full">예약 신청하기</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
