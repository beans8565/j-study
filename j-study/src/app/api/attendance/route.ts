import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date') // YYYY-MM-DD 형식
  
  try {
    let whereClause = {}
    if (dateParam) {
      const startOfDay = new Date(dateParam)
      const endOfDay = new Date(dateParam)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      whereClause = {
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } }
      },
      orderBy: { date: "desc" }
    })
    
    return NextResponse.json(attendances)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

// 학생 출결 기록 저장/수정
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, status, date } = body

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        status, // 'PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE'
        date: date ? new Date(date) : new Date(),
        checkIn: status === 'PRESENT' || status === 'LATE' ? new Date() : null,
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
