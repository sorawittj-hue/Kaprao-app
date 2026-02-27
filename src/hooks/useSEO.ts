import { useEffect } from 'react'

interface SEOProps {
    title: string
    description?: string
    image?: string
}

export function useSEO({ title, description, image }: SEOProps) {
    useEffect(() => {
        // 1. Title
        const currentTitle = document.title
        const fullTitle = `${title} | กะเพรา 52`
        document.title = fullTitle

        // 2. Meta Description
        const metaDescription = document.querySelector('meta[name="description"]')
        const currentDescription = metaDescription?.getAttribute('content')
        if (metaDescription && description) {
            metaDescription.setAttribute('content', description)
        }

        // 3. Open Graph / Social Tags
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
            ogTitle = document.createElement('meta')
            ogTitle.setAttribute('property', 'og:title')
            document.head.appendChild(ogTitle)
        }
        ogTitle.setAttribute('content', fullTitle)

        let ogDesc = document.querySelector('meta[property="og:description"]')
        if (!ogDesc && description) {
            ogDesc = document.createElement('meta')
            ogDesc.setAttribute('property', 'og:description')
            document.head.appendChild(ogDesc)
        }
        if (ogDesc && description) {
            ogDesc.setAttribute('content', description)
        }

        // Cleanup when component unmounts
        return () => {
            document.title = currentTitle
            if (metaDescription && currentDescription) {
                metaDescription.setAttribute('content', currentDescription)
            }
        }
    }, [title, description, image])
}
