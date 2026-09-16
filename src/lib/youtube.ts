/** Extracts the video id from any common YouTube URL shape
 * (watch?v=, youtu.be/, embed/, shorts/). Returns null when the URL isn't recognized. */
export function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      const embedMatch = /^\/(embed|shorts)\/([^/]+)/.exec(parsed.pathname)
      if (embedMatch) return embedMatch[2]
    }
    return null
  } catch {
    return null
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
