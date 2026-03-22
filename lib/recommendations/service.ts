import { searchRelatedArticles } from './blogger-feed'
import { articleMap, fallbackArticle } from './article-map'

export interface RecommendedArticle {
  title: string
  url: string
  source: 'map' | 'search' | 'fallback'
}

const stopWords = new Set([
  '的', '是', '我', '有', '在', '了', '不', '都', '很', '也', '和', '你', '他', '她', '嗎', '呢'
])

function extractKeywords(content: string): string[] {
  const cleaned = content.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, ' ')
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2)
  
  const frequency: Record<string, number> = {}
  for (const word of words) {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] ?? 0) + 1
    }
  }
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

export async function getRecommendedArticle(content: string): Promise<RecommendedArticle> {
  for (const [keyword, url] of Object.entries(articleMap)) {
    if (content.includes(keyword)) {
      return {
        title: `更多關於「${keyword}」的文章`,
        url,
        source: 'map',
      }
    }
  }
  
  const keywords = extractKeywords(content)
  const searchResults = await searchRelatedArticles(keywords)
  
  if (searchResults.length > 0) {
    return {
      title: searchResults[0].title,
      url: searchResults[0].url,
      source: 'search',
    }
  }
  
  return {
    title: '探索更多心理健康資訊',
    url: fallbackArticle,
    source: 'fallback',
  }
}
