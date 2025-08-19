// stockSlice.js
import { createSlice } from '@reduxjs/toolkit'

export const stockSlice = createSlice({
	name: 'stock',
	initialState: {
		stock: {}, // Objeto: { productName: quantity }
		status: 'idle', // idle | loading | saving | error
	},
	reducers: {
		addProductToStock: (state, action) => {
			const { productName, quantity } = action.payload
			const currentStock = state.stock[productName] || 0
			state.stock[productName] = currentStock + quantity
			state.status = 'idle'
		},
		
		removeProductFromStock: (state, action) => {
			const { productName } = action.payload
			delete state.stock[productName]
			state.status = 'idle'
		},
		
		updateStock: (state, action) => {
			const { productName, quantity } = action.payload
			state.stock[productName] = quantity
			state.status = 'idle'
		},
		
		resetStock: (state) => {
			state.stock = {}
			state.status = 'idle'
		},
		
		// ✅ Recibir datos de Firebase (productName: quantity)
		setStock: (state, action) => {
			state.stock = action.payload || {}
			state.status = 'idle'
		},
		
		setStatus: (state, action) => {
			state.status = action.payload
		},
	}
})

export const { 
	addProductToStock, 
	removeProductFromStock, 
	updateStock, 
	resetStock, 
	setStock,
	setStatus
} = stockSlice.actions