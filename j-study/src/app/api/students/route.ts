import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })
    
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// 신규 학생 등록
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, phone } = body

    // 임시 비밀번호는 전화번호 뒷자리 등 정책에 따라 설정 가능
    // DB 연결 시에는 암호화 (bcrypt 등) 필수!
    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: "STUDENT",
      }
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
