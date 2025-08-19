import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { productSlice } from './slices/productSlice'
import { stockSlice } from './slices/stockSlice'
import { stockHistorySlice } from './slices/stockHistorySlice'
import { posSlice } from './slices/posSlice'

export const store = configureStore({
	reducer: {
		auth: authSlice.reducer,
		product: productSlice.reducer,
		stock: stockSlice.reducer,
		stockHistory: stockHistorySlice.reducer,
		pos: posSlice.reducer
	}
})
