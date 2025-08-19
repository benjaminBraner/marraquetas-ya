    // Extraer public_id de la URL
    export const getPublicImgIdFromUrl = (url) => {
        // URL: https://res.cloudinary.com/dweluw8de/image/upload/v1234/sample.jpg
        const urlParts = url.split('/')
        const uploadIndex = urlParts.findIndex(part => part === 'upload')
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
            const filename = urlParts[urlParts.length - 1]
            return filename.split('.')[0] // Quitar extensión
        }
        return null
    }
    