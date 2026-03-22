import { NextRequest, NextResponse } from 'next/server'
import { getRecommendedArticle } from '@/lib/recommendations/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const article = await getRecommendedArticle(content)
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
