import { doc, getDoc } from 'firebase/firestore'
import { FirestoreDB } from '../../firebase/firebase-config'

// Función para obtener el role por ID de documento
export const getUserRole = async (userId) => {
	try {
		const userDoc = await getDoc(doc(FirestoreDB, 'users', userId))
		if (userDoc.exists()) {
			return userDoc.data().role
		}
	} catch (error) {
		console.error('Error obteniendo role:', error)
	}
}

