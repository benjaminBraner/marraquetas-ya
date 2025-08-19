import { useEffect } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { useDispatch } from 'react-redux'
import { FirestoreDB } from '../../firebase/firebase-config'
import { setProducts } from '../store/slices/productSlice'
import { setStock } from '../store/slices/stockSlice'
import { setStatus } from '../store/slices/stockHistorySlice'
import { setSales, setStatus as setPosStatus } from '../store/slices/posSlice'
import { getTodayDate } from '../helpers/getTodayDate'

const today = getTodayDate()

export const useFirebaseSync = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		// console.log('🔄 Iniciando sincronización con Firebase...')

		// ✅ Suscripción a productos
		const unsubscribeProducts = onSnapshot(
			collection(FirestoreDB, 'products'),
			(snapshot) => {
				const productos = []
				snapshot.forEach((doc) => {
					productos.push({ id: doc.id, ...doc.data() })
				})
				console.log('📦 Productos actualizados desde Firebase:', productos.length)
				
				// Actualizar Redux con productos
				dispatch(setProducts(productos))
			},
			(error) => {
				console.error('❌ Error en sincronización de productos:', error)
			}
		)

		// ✅ Suscripción a stock (productName: cantidad)
		const unsubscribeStock = onSnapshot(
			doc(FirestoreDB, `stock/${today}`),
			(docSnapshot) => {
				if (docSnapshot.exists()) {
					const stockData = docSnapshot.data()
					console.log(`🛒 Stock del ${today}:`, stockData)

					// ✅ Firebase ya tiene formato { productName: quantity }
					dispatch(setStock(stockData))
				} else {
					console.log(`🔭 No hay stock para ${today}`)
					dispatch(setStock({}))
				}
			},
			(error) => {
				console.error('❌ Error en stock:', error)
			}
		)

		// ✅ Suscripción al historial del día
		const unsubscribeHistory = onSnapshot(
			doc(FirestoreDB, `history/${today}`),
			(docSnapshot) => {
				if (docSnapshot.exists()) {
					const historyData = docSnapshot.data()
					const entries = historyData.entries || []
					
					console.log(`📋 Historial del ${today}:`, entries.length, 'entradas')
					
					// Actualizar Redux con las entradas ordenadas por fecha (más reciente primero)
					const sortedEntries = [...entries].sort((a, b) => 
						new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
					)
					
					// Usar una acción específica para setear todo el historial desde Firebase
					dispatch({
						type: 'stockHistory/setHistoryFromFirebase',
						payload: sortedEntries
					})
					
					dispatch(setStatus('idle'))
				} else {
					console.log(`🔭 No hay historial para ${today}`)
					// Si no existe el documento, limpiar el historial local
					dispatch({
						type: 'stockHistory/setHistoryFromFirebase',
						payload: []
					})
					dispatch(setStatus('idle'))
				}
			},
			(error) => {
				console.error('❌ Error en historial:', error)
				dispatch(setStatus('error'))
			}
		)

		// ✅ Nueva suscripción al POS del día
		const unsubscribePOS = onSnapshot(
			doc(FirestoreDB, `pos/${today}`),
			(docSnapshot) => {
				if (docSnapshot.exists()) {
					const posData = docSnapshot.data()
					const sales = posData.sales || []
					
					console.log(`💰 POS del ${today}:`, sales.length, 'ventas')
					
					// Actualizar Redux con las ventas ordenadas por fecha (más reciente primero)
					const sortedSales = [...sales].sort((a, b) => 
						new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
					)
					
					// Actualizar el estado de POS en Redux
					dispatch(setSales(sortedSales))
					dispatch(setPosStatus('idle'))
				} else {
					console.log(`🔭 No hay ventas POS para ${today}`)
					// Si no existe el documento, limpiar las ventas locales
					dispatch(setSales([]))
					dispatch(setPosStatus('idle'))
				}
			},
			(error) => {
				console.error('❌ Error en POS:', error)
				dispatch(setPosStatus('error'))
			}
		)

		return () => {
			// console.log('🛑 Cerrando sincronización con Firebase')
			unsubscribeProducts()
			unsubscribeStock()
			unsubscribeHistory()
			unsubscribePOS()
		}
	}, [dispatch])
}