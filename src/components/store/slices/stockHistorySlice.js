// stockHistorySlice.js
import { createSlice } from '@reduxjs/toolkit'

export const stockHistorySlice = createSlice({
	name: 'stockHistory',
	initialState:{
		history: [],
		status: 'idle', // idle | loading | saving | error
	},
	reducers: {
		addHistoryEntry: (state, action) => {
			const entry = { ...action.payload }
			state.history.unshift(entry) // Agregar al inicio del array
			state.status = 'idle'
		},
		clearHistory: (state) => {
			state.history = []
		},
		setStatus: (state, action) => {
			state.status = action.payload
		},
		// ✅ Nueva acción para sincronizar desde Firebase
		setHistoryFromFirebase: (state, action) => {
			state.history = action.payload
		}
	}
})

export const { 
	addHistoryEntry, 
	clearHistory, 
	setStatus, 
	setHistoryFromFirebase 
} = stockHistorySlice.actions