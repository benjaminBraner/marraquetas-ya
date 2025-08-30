import { useDispatch, useSelector } from 'react-redux'
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { FirestoreDB } from '../../firebase/firebase-config'
import { getTodayDate } from '../helpers/getTodayDate'
import { setStatus, addHistoryEntry, clearHistory } from '../store/slices/stockHistorySlice'

export const useStockHistoryStore = () => {
	const dispatch = useDispatch()
	const { history, status } = useSelector((state) => state.stockHistory)

	const savingStatus = 'saving'
	const loadingStatus = 'loading'
	const idleStatus = 'idle'
	const errorStatus = 'error'

	const startAddHistoryEntry = async (entry) => {
		dispatch(setStatus(savingStatus))

		try {
			// 📅 PASO 1: Obtener la fecha de hoy
			const today = getTodayDate() // "2025-08-16"
			const stockHistoryDocRef = doc(FirestoreDB, `history/${today}`)
			console.log('📄 Referencia del documento:', stockHistoryDocRef)

			console.log('📝 Entry a guardar:', entry)

			// 💾 PASO 2: Intentar actualizar documento existente
			try {
				console.log('🔄 Intentando actualizar documento existente...')
				await updateDoc(stockHistoryDocRef, {
					entries: arrayUnion(entry)
				})
				console.log('✅ Documento actualizado correctamente')
			} catch (updateError) {
				// 📄 PASO 3: Si no existe el documento, crearlo
				if (updateError.code === 'not-found') {
					console.log('📋 Documento no existe, creando nuevo...')
					await setDoc(stockHistoryDocRef, {
						entries: [entry]
					})
					console.log('✅ Nuevo documento creado correctamente')
				} else {
					// Si es otro error, lanzarlo
					throw updateError
				}
			}

			// 🔄 PASO 4: Actualizar estado local de Redux
			// dispatch(addHistoryEntry(entry))
			// dispatch(setStatus(idleStatus))

			console.log('🎉 Entrada de historial guardada exitosamente')
		} catch (error) {
			console.log('❌ Error guardando historial:', error)
			dispatch(setStatus(errorStatus))
			// throw error // Descomentarlo si quieres que el error se propague
		}
	}

	const startClearHistory = async () => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const historyRef = doc(FirestoreDB, 'history', today)

			// Limpiar las entradas pero mantener metadatos
			await updateDoc(historyRef, {
				entries: [],
				lastUpdated: new Date().toISOString(),
				cleared: true,
				clearedAt: new Date().toISOString()
			})

			// Limpiar Redux
			// dispatch(clearHistory())
			dispatch(setStatus(idleStatus))

			console.log('🗑️ Historial limpiado')
		} catch (error) {
			console.error('❌ Error limpiando historial:', error)
			dispatch(setStatus(errorStatus))
			throw error
		}
	}

	const getStockHistoryFromDay = async (date) => {
		dispatch(setStatus(loadingStatus))
		
		try {
			const historyRef = doc(FirestoreDB, 'history', date)
			const historySnapshot = await getDoc(historyRef)
			const historyData = historySnapshot.data()
			dispatch(setStatus(idleStatus))
			return historyData
		} catch (error) {
		if (error.code === 'not-found') {
			dispatch(setStatus(idleStatus))
			return null
		} else {
			dispatch(setStatus(errorStatus))
			throw error
		}
		}
	}
	
	return {
		// State
		history,
		historyStatus: status,

		// Actions
		startAddHistoryEntry,
		startClearHistory,
		getStockHistoryFromDay,

		// Status helpers
		isSavingHistory: status === savingStatus,
		isLoadingHistory: status === loadingStatus,
		isHistoryIdle: status === idleStatus,
		hasHistoryError: status === errorStatus
	}
}
