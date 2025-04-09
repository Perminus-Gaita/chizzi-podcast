export default function manifest() {
    return {
        name: 'Wufwuf',
        short_name: 'Wufwuf',
        description: 'Organize, manage and play Kadi esports tournaments and games.',
        start_url: '/arena',
        id: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/wufwuf-icon/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/wufwuf-icon/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            }
        ],
        // screenshots: [
        //     {
        //         src: '/wufwuf-icon/web-app-manifest-512x512.png',
        //         type: 'image/png',
        //         sizes: '512x512',
        //         form_factor: 'wide'
        //     },
        //     {
        //         src: '/wufwuf-icon/web-app-manifest-512x512.png',
        //         type: 'image/png',
        //         sizes: '512x512',
        //         form_factor: 'narrow'
        //     }
        // ]
    }
}