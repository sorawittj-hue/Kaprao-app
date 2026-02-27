import { ComponentType, lazy } from 'react'

/**
 * A wrapper around React.lazy that automatically retries the import on failure.
 * This is particularly useful for handling Vite chunk load failures when a new 
 * version of the app is deployed and the old chunks are no longer available.
 */
export function lazyWithRetry(
    componentImport: () => Promise<{ default: ComponentType<any> }>,
    name?: string
) {
    return lazy(async () => {
        const pageHasBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
        )

        try {
            const component = await componentImport()
            // If successful, reset the refresh flag after a delay to ensure the page is stable
            window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
            return component
        } catch (error: any) {
            console.error(`💥 Failed to load chunk ${name || ''}:`, error)

            // Only force refresh if we haven't already refreshed this session
            // This prevents infinite reload loops if the chunk is actually missing
            if (!pageHasBeenForceRefreshed) {
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
                console.log('🔄 Chunk loading failed. Forcing page refresh to get latest version...')
                window.location.reload()
                return { default: () => null } as any
            }

            // If we've already refreshed and it still fails, let the ErrorBoundary handle it
            throw error
        }
    })
}
