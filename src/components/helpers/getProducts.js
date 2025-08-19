import { collection, getDocs } from 'firebase/firestore'
import { FirestoreDB } from '../../firebase/firebase-config'

export const getProducts = async () => {
    try {
        const collectionRef = collection(FirestoreDB, 'products')
        const docs = await getDocs(collectionRef)
        
        // Usa .docs en lugar de ._docs
        return docs.docs.map((doc) => ({ 
            id: doc.id, 
            ...doc.data() 
        }))
    } catch (error) {
        console.error('Error getting products:', error)
        throw error
    }
}