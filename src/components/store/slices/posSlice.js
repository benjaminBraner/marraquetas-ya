// store/slices/posSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	sales: [],
	status: 'idle', // 'idle' | 'loading' | 'saving' | 'error'
	todayTotal: 0,
	error: null
}

export const posSlice = createSlice({
	name: 'pos',
	initialState,
	reducers: {
		setStatus: (state, action) => {
			state.status = action.payload
		},
		addSale: (state, action) => {
			state.sales.push(action.payload)
			state.todayTotal = state.sales.reduce((total, sale) => total + sale.total, 0)
		},
		setSales: (state, action) => {
			state.sales = action.payload
			state.todayTotal = state.sales.reduce((total, sale) => total + sale.total, 0)
		},
		clearSales: (state) => {
			state.sales = []
			state.todayTotal = 0
		},
		setError: (state, action) => {
			state.error = action.payload
			state.status = 'error'
		}
	}
})

export const { setStatus, addSale, setSales, clearSales, setError } = posSlice.actions