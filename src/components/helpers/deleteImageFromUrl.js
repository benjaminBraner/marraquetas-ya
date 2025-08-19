import { getPublicImgIdFromUrl } from './getPublicImgIdFromUrl'

export const deleteImageFromUrl = async (imageUrl) => {
	const cloudName = 'dweluw8de'

	const publicId = getPublicImgIdFromUrl(imageUrl)
	if (!publicId) {
		throw new Error('No se pudo extraer el public_id de la URL')
	}

	const data = new FormData()
	data.append('public_id', publicId)
	data.append('upload_preset', 'marraquetas-ya')

	try {
		const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
			method: 'POST',
			body: data
		})

		const result = await res.json()
		console.log('Resultado eliminación:', result)
		return result
	} catch (error) {
		console.error('Error deleting image:', error)
		throw error
	}
}
