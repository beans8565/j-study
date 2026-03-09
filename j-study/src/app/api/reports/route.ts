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
  const dateParam = searchParams.get('date')
  
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

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { date: "desc" }
    })
    
    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, attitudeScore, comments, date } = body

    const report = await prisma.report.create({
      data: {
        userId,
        attitudeScore: Number(attitudeScore),
        comments,
        date: date ? new Date(date) : new Date(),
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
  }
}
