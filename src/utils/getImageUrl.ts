export function getValidImageUrl(url: string | undefined | null): string {
    if (!url) return '/images/logo.png'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    return `/images/${url}`
}
