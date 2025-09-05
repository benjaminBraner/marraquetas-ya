import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStatus } from '../store/slices/stockSlice'
import { FirestoreDB } from '../../firebase/firebase-config'
import { getTodayDate } from '../helpers/getTodayDate'
import { doc, setDoc, updateDoc, getDoc, deleteField } from 'firebase/firestore'

export const useStockStore = () => {
	const dispatch = useDispatch()
	const { stock, status: stockStatus } = useSelector((state) => state.stock)

	const savingStatus = 'saving'
	const loadingStatus = 'loading'
	const idleStatus = 'idle'
	const errorStatus = 'error'

	// ✅ Helper: Obtener cantidad actual de un producto por nombre
	const getCurrentQuantity = (productName) => {
		return stock[productName] || 0
	}

	// ✅ AGREGAR/ACTUALIZAR stock por nombre de producto
	const startAddStockToday = async (productName, quantity) => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const stockDocRef = doc(FirestoreDB, `stock/${today}`)

			// ✅ Guardar usando productName como key
			await setDoc(
				stockDocRef,
				{
					[productName]: quantity
				},
				{ merge: true }
			)

			console.log(`✅ Stock de "${productName}" actualizado: ${quantity}`)
			dispatch(setStatus(idleStatus))
		} catch (error) {
			console.error('Error agregando stock:', error)
			dispatch(setStatus(errorStatus))
		}
	}

	// ✅ SUMAR a stock existente por nombre
	const startAddToExistingStock = async (productName, quantityToAdd) => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const stockDocRef = doc(FirestoreDB, `stock/${today}`)

			// Obtener stock actual del Redux (más eficiente)
			const currentStock = getCurrentQuantity(productName)
			const newQuantity = currentStock + quantityToAdd

			await setDoc(
				stockDocRef,
				{
					[productName]: newQuantity
				},
				{ merge: true }
			)

			console.log(`✅ "${productName}": ${currentStock} + ${quantityToAdd} = ${newQuantity}`)
			dispatch(setStatus(idleStatus))
		} catch (error) {
			console.error('Error:', error)
			dispatch(setStatus(errorStatus))
		}
	}

	// ✅ REMOVER producto del stock por nombre
	const startRemoveFromStock = async (productName) => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const stockDocRef = doc(FirestoreDB, `stock/${today}`)

			await updateDoc(stockDocRef, {
				[productName]: deleteField() // Elimina la key completamente
			})

			console.log(`🗑️ "${productName}" removido del stock`)
			dispatch(setStatus(idleStatus))
		} catch (error) {
			console.error('Error:', error)
			dispatch(setStatus(errorStatus))
		}
	}

	// ✅ ACTUALIZAR cantidad específica por nombre
	const startUpdateStock = async (productName, newQuantity) => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const stockDocRef = doc(FirestoreDB, `stock/${today}`)

			await setDoc(
				stockDocRef,
				{
					[productName]: newQuantity
				},
				{ merge: true }
			)

			console.log(`✅ "${productName}" actualizado a: ${newQuantity}`)
			dispatch(setStatus(idleStatus))
		} catch (error) {
			console.error('Error:', error)
			dispatch(setStatus(errorStatus))
		}
	}

	const startWithdrawStock = async (productName, quantityToWithdraw) => {
		dispatch(setStatus(savingStatus))

		try {
			const today = getTodayDate()
			const stockDocRef = doc(FirestoreDB, `stock/${today}`)

			// Obtener stock actual del Redux
			const currentStock = getCurrentQuantity(productName)
			const newQuantity = Math.max(0, currentStock - quantityToWithdraw) // No permitir negativos

			if (newQuantity === 0) {
				// Si queda en 0, eliminar el producto del documento
				await updateDoc(stockDocRef, {
					[productName]: deleteField()
				})
			} else {
				// Actualizar con la nueva cantidad
				await setDoc(
					stockDocRef,
					{
						[productName]: newQuantity
					},
					{ merge: true }
				)
			}

			console.log(`✅ "${productName}": ${currentStock} - ${quantityToWithdraw} = ${newQuantity}`)
			dispatch(setStatus(idleStatus))
		} catch (error) {
			console.error('Error retirando stock:', error)
			dispatch(setStatus(errorStatus))
			throw error // Re-throw para manejo en el componente
		}
	}

	// ✅ Helpers para trabajar con el formato { productName: quantity }
	const getProductStock = (productName) => {
		return stock[productName] || 0
	}

	const getTotalProducts = () => Object.keys(stock).length

	const getTotalQuantity = () => {
		return Object.values(stock).reduce((total, quantity) => total + quantity, 0)
	}

	const getLowStockProducts = (threshold = 5) => {
		return Object.entries(stock)
			.filter(([productName, quantity]) => quantity <= threshold && quantity > 0)
			.map(([productName, quantity]) => ({ productName, quantity }))
	}

	const getOutOfStockProducts = () => {
		return Object.entries(stock)
			.filter(([productName, quantity]) => quantity === 0)
			.map(([productName, quantity]) => ({ productName, quantity }))
	}

	// ✅ Obtener lista de productos en stock como array para fácil renderizado
	const getStockAsArray = () => {
		return Object.entries(stock).map(([productName, quantity]) => ({
			productName,
			quantity
		}))
	}

	return {
		// Métodos Firebase
		startAddStockToday,
		startAddToExistingStock,
		startRemoveFromStock,
		startUpdateStock,
		startWithdrawStock,

		// Helpers
		getProductStock,
		getCurrentQuantity,
		getTotalProducts,
		getTotalQuantity,
		getLowStockProducts,
		getOutOfStockProducts,
		getStockAsArray,

		// Estado
		stock, // Objeto: { productName: quantity }
		stockStatus
	}
}
