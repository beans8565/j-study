import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center font-bold text-xl" href="/">
          J-Study
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            시설 소개
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/inquiry">
            상담 예약
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-primary" href="/login">
            로그인
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  최고의 집중력을 경험하세요
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  제이스터디 관리형 독서실은 체계적인 관리와 최고의 학습 환경을 제공합니다.
                </p>
              </div>
              <div className="space-x-4">
                <Button render={<Link href="/inquiry" />} size="lg">상담 예약하기</Button>
                <Button render={<Link href="/login" />} variant="outline" size="lg">수강생 로그인</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle>철저한 출결 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  지문 인식 및 시스템을 통한 정확한 출석, 지각, 조퇴 관리로 학습 습관을 잡아줍니다.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>일일 학습 리포트</CardTitle>
                </CardHeader>
                <CardContent>
                  매일 자습 태도와 학습 진행 상황을 체크하여 학부모님께 투명하게 공유합니다.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>프리미엄 학습 공간</CardTitle>
                </CardHeader>
                <CardContent>
                  인체공학적 책상과 의자, 백색소음기 등 오직 집중만을 위한 최적의 환경을 제공합니다.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 J-Study. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            이용약관
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            개인정보처리방침
          </Link>
        </nav>
      </footer>
    </div>
  )
}
