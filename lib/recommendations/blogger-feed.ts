interface BloggerPost {
  id: { $t: string }
  title: { $t: string }
  link: Array<{ rel: string; href: string }>
  content: { $t: string }
}

interface BloggerFeedResponse {
  feed: {
    entry?: BloggerPost[]
  }
}

export async function searchRelatedArticles(
  keywords: string[],
  options?: { maxResults?: number }
): Promise<{ title: string; url: string }[]> {
  const maxResults = options?.maxResults ?? 5
  const query = keywords.slice(0, 3).join(' ')
  
  if (!query) {
    return []
  }

  try {
    const url = `https://www.leepsyclinic.com/feeds/posts/default?alt=json&q=${encodeURIComponent(query)}&max-results=${maxResults}`
    const response = await fetch(url)
    
    if (!response.ok) {
      return []
    }
    
    const data: BloggerFeedResponse = await response.json()
    
    if (!data.feed.entry) {
      return []
    }
    
    return data.feed.entry
      .map((entry) => {
        const alternateLink = entry.link.find((l) => l.rel === 'alternate')
        return {
          title: entry.title.$t,
          url: alternateLink?.href ?? '',
        }
      })
      .filter((item) => item.url !== '')
  } catch {
    return []
  }
}
