export const fileUpload = async (file) => {
    const cloudName = 'dweluw8de'
    const presetName = 'marraquetas-ya'
    const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` // Ya incluye 'upload'
    
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', presetName)
    // No necesitas agregar cloud_name, ya está en la URL
    
    try {
        const res = await fetch(baseUrl, { // Cambia esto: era baseUrl + 'upload'
            method: 'POST',
            body: data
        })
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const uploadedImgUrl = await res.json()
        console.log('Respuesta completa:', uploadedImgUrl) // Para debug
        
        return uploadedImgUrl.secure_url // Usa secure_url en lugar de url
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}