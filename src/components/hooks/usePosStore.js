import { useDispatch, useSelector } from 'react-redux'
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { FirestoreDB } from '../../firebase/firebase-config'
import { getTodayDate } from '../helpers/getTodayDate'
import { setStatus, addSale, clearSales } from '../store/slices/posSlice'

export const usePosStore = () => {
	const dispatch = useDispatch()
	const { sales, status, todayTotal } = useSelector((state) => state.pos)

	const savingStatus = 'saving'
	const loadingStatus = 'loading'
	const idleStatus = 'idle'
	const errorStatus = 'error'

	const startAddSale = async (sale) => {
		dispatch(setStatus(savingStatus))

		try {
			// 📅 PASO 1: Obtener la fecha de hoy
			const today = getTodayDate() // "2025-08-16"
			const posDocRef = doc(FirestoreDB, `pos/${today}`)
			console.log('📄 Referencia del documento POS:', posDocRef)

			// Agregar timestamp y ID único a la venta
			const saleWithMetadata = {
				...sale,
				id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				timestamp: new Date().toISOString(),
				date: today
			}

			console.log('🛒 Venta a guardar:', saleWithMetadata)

			// 💾 PASO 2: Intentar actualizar documento existente
			try {
				console.log('📄 Intentando actualizar documento existente...')
				await updateDoc(posDocRef, {
					sales: arrayUnion(saleWithMetadata),
					lastSale: new Date().toISOString(),
					totalSales: sales.length + 1
				})
				console.log('✅ Documento actualizado correctamente')
			} catch (updateError) {
				// 📄 PASO 3: Si no existe el documento, crearlo
				if (updateError.code === 'not-found') {
					console.log('📋 Documento no existe, creando nuevo...')
					await setDoc(posDocRef, {
						sales: [saleWithMetadata],
						createdAt: new Date().toISOString(),
						lastSale: new Date().toISOString(),
						totalSales: 1,
						date: today
					})
					console.log('✅ Nuevo documento creado correctamente')
				} else {
					// Si es otro error, lanzarlo
					throw updateError
				}
			}

			// 📄 PASO 4: Actualizar estado local de Redux
			// dispatch(addSale(saleWithMetadata))
			dispatch(setStatus(idleStatus))

			console.log('🎉 Venta guardada exitosamente')
			return saleWithMetadata
		} catch (error) {
			console.log('❌ Error guardando venta:', error)
			dispatch(setStatus(errorStatus))
			throw error
		}
	}

	const startClearSales = async () => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const posRef = doc(FirestoreDB, 'pos', today)

			// Limpiar las ventas pero mantener metadatos
			await updateDoc(posRef, {
				sales: [],
				lastUpdated: new Date().toISOString(),
				cleared: true,
				clearedAt: new Date().toISOString(),
				totalSales: 0
			})

			// Limpiar Redux
			dispatch(clearSales())
			dispatch(setStatus(idleStatus))

			console.log('🗑️ Ventas limpiadas')
		} catch (error) {
			console.error('❌ Error limpiando ventas:', error)
			dispatch(setStatus(errorStatus))
			throw error
		}
	}

	// Calcular totales
	const getTodayTotal = () => {
		return sales.reduce((total, sale) => total + (sale.total || 0), 0)
	}

	const getTotalSales = () => sales.length

	const getTotalQuantitySold = () => {
		return sales.reduce((total, sale) => {
			return total + sale.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0)
		}, 0)
	}

	const getBestSellingProducts = () => {
		const productCount = {}
		
		sales.forEach(sale => {
			sale.items.forEach(item => {
				if (productCount[item.productName]) {
					productCount[item.productName] += item.quantity
				} else {
					productCount[item.productName] = item.quantity
				}
			})
		})

		return Object.entries(productCount)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5)
			.map(([productName, quantity]) => ({ productName, quantity }))
	}

	return {
		// State
		sales,
		posStatus: status,
		todayTotal,

		// Actions
		startAddSale,
		startClearSales,

		// Helpers
		getTodayTotal,
		getTotalSales,
		getTotalQuantitySold,
		getBestSellingProducts,

		// Status helpers
		isSavingPos: status === savingStatus,
		isLoadingPos: status === loadingStatus,
		isPosIdle: status === idleStatus,
		hasPosError: status === errorStatus
	}
}